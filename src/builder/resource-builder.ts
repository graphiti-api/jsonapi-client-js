import {
  JsonapiResourceObject,
  JsonapiResourceRelationshipIdentifiers,
  JsonapiResourceResponseDocument,
  JsonapiResourceListResponseDocument,
  JsonapiSuccessResponseDocument,
  JsonapiResourceIdentifier,
} from "../jsonapi-spec"

export type RecordAssociationHash<T> = {
  [type: string]: {
    [id: string]: RecordData<T>
  }
}

/*
 * This is an intermediate type designed to hold a partially build up record
 * and its relationships.  In order to correctly build out the graph and not duplicate
 * objects too much, we must first build up each record instance and then walk the
 * graph and assign the instances to each other record where the relationship object
 * requires it.
 */
export type RecordData<T> = {
  attributes: Record<string, any>
  relationshipIdentifiers: JsonapiResourceRelationshipIdentifiers
  record: T
  relationships?: Record<string, T | T[]>
  visited: boolean
}

export interface IResourceBuilder<T> {
  buildDocumentResources(doc: JsonapiResourceResponseDocument): T
  buildDocumentResources(doc: JsonapiResourceListResponseDocument): T[]

  buildRecord(attributes: Record<any, string>): T
}

export abstract class ResourceBuilder<T> implements IResourceBuilder<T> {
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

  public abstract buildRecord(attributes: Record<string, any>): T

  public abstract assignAssociations(
    record: T,
    associations: Record<string, T | T[]>
  ): void

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

  buildIntermediateData(
    resourceResponse: JsonapiResourceObject
  ): RecordData<T> {
    // Need to benchmark this.  May be worth adding lodash.clonedeep
    let attrs: Record<string, any> = JSON.parse(
      JSON.stringify(resourceResponse.attributes)
    )
    attrs.id = resourceResponse.id as string

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
