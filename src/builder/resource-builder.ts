import {
  JsonapiResponseDocument,
  JsonapiResourceObject,
  JsonapiResourceRelationshipIdentifiers,
  JsonapiResourceResponseDocument,
  JsonapiResourceListResponseDocument,
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

  buildIntermediateResultsHash(
    responseDoc: JsonapiResponseDocument
  ): RecordAssociationHash<T>

  buildRecord(attributes: Record<any, string>): T

  buildIntermediateData(resourceResponse: JsonapiResourceObject): RecordData<T>
}
