import {
  IResourceBuilder,
  RecordAssociationHash,
  RecordData,
} from "./resource-builder"

import {
  JsonapiResourceResponseDocument,
  JsonapiResourceListResponseDocument,
  JsonapiSuccessResponseDocument,
  JsonapiResourceObject,
  JsonapiResourceIdentifier,
} from "../jsonapi-spec"

function processOneOrArray<T, R>(data: T, callback: (item: T) => R): R
function processOneOrArray<T, R>(data: T[], callback: (item: T) => R): R[]
function processOneOrArray<T, R>(
  data: T | T[],
  callback: (item: T) => R
): R | R[] {
  if (data instanceof Array) {
    return data.map(callback)
  } else {
    return callback(data)
  }
}

export class SimpleResourceBuilder<T = Record<string, any>>
  implements IResourceBuilder<T> {
  public buildDocumentResources<R extends T>(
    doc: JsonapiResourceResponseDocument | JsonapiResourceListResponseDocument
  ): R | R[] {
    let resultsHash = this.buildIntermediateResultsHash(doc)

    this._assembleResourceGraph(resultsHash, doc.data)

    if (doc.data instanceof Array) {
      return doc.data.map(
        item => this._lookupRecord(resultsHash, item).record as R
      ) as R[]
    } else {
      return this._lookupRecord(resultsHash, doc.data).record as R
    }
  }

  buildIntermediateResultsHash(
    responseDoc: JsonapiSuccessResponseDocument
  ): RecordAssociationHash<T> {
    let hash: RecordAssociationHash<T> = {}

    if (responseDoc.data instanceof Array) {
      responseDoc.data.forEach(item => {
        this._appendRecord(hash, item)
      })
    } else {
      this._appendRecord(hash, responseDoc.data)
    }

    if (responseDoc.included) {
      responseDoc.included.forEach(item => {
        this._appendRecord(hash, item)
      })
    }

    return hash
  }

  buildRecord(attributes: Record<string, any>): T {
    return { ...attributes } as T
  }

  assignAssociations(record: T, associations: Record<string, T | T[]>) {
    Object.keys(associations).forEach(key => {
      ;(record as any)[key] = associations[key]
    })
  }

  buildIntermediateData(
    resourceResponse: JsonapiResourceObject
  ): RecordData<T> {
    let attrs: Record<string, any> = {
      id: resourceResponse.id as string,
      ...resourceResponse.attributes,
    }

    let result: RecordData<T> = {
      attributes: attrs as any,
      record: this.buildRecord(attrs),
      relationshipIdentifiers: resourceResponse.relationships || {},
      visited: false,
    }

    return result
  }

  private _appendRecord(
    hash: RecordAssociationHash<T>,
    item: JsonapiResourceObject
  ) {
    let type = item.type
    let typeGroup = hash[type]

    if (!typeGroup) {
      typeGroup = hash[type] = {}
    }

    typeGroup[item.id as string] = this.buildIntermediateData(item)
  }

  private _assembleResourceGraph(
    hash: RecordAssociationHash<T>,
    entryPoint: JsonapiResourceObject | JsonapiResourceObject[]
  ): void {
    if (entryPoint instanceof Array) {
      entryPoint.forEach(item => {
        this._linkRecords(hash, this._lookupRecord(hash, item))
      })
    } else {
      this._linkRecords(hash, this._lookupRecord(hash, entryPoint))
    }
  }

  private _linkRecords(
    hash: RecordAssociationHash<T>,
    resourceRecord: RecordData<T>
  ): void {
    if (resourceRecord.visited) {
      return
    } else {
      resourceRecord.visited = true
    }

    const relationshipIds = resourceRecord.relationshipIdentifiers

    resourceRecord.relationships = {}
    const relationships = resourceRecord.relationships

    Object.keys(relationshipIds).forEach(key => {
      let assocation = relationshipIds[key].data

      if (assocation instanceof Array) {
        relationships[key] = assocation.map(item => {
          const itemRecord = this._lookupRecord(hash, item)
          this._linkRecords(hash, itemRecord)
          return itemRecord.record
        })
      } else {
        const itemRecord = this._lookupRecord(hash, assocation)
        this._linkRecords(hash, itemRecord)
        relationships[key] = itemRecord.record
      }
    })

    this.assignAssociations(resourceRecord.record, relationships)
  }

  private _lookupRecord(
    hash: RecordAssociationHash<T>,
    item: JsonapiResourceIdentifier
  ): RecordData<T> {
    return hash[item.type][item.id as string]
  }
}
