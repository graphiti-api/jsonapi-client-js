// For non-standard extensions
export type JsonapiMeta = object

type Type = string
type ID = string

export type JsonapiResourceIds = {
  id?: ID
  "temp-id"?: ID
}
export interface JsonapiResourceIdentifier extends JsonapiResourceIds {
  type: Type
  meta?: JsonapiMeta
}

export type JsonapiResourceAttributes = Record<string, any>
export type JsonapiResourceLinks = Record<string, JsonapiLink>

export type JsonapiResourceRelationshipIdentifiers = Record<
  string,
  { data: JsonapiResourceIdentifier | JsonapiResourceIdentifier[] }
>

export interface JsonapiResourceObject extends JsonapiResourceIdentifier {
  attributes: JsonapiResourceAttributes // but not `relationships` or `links`
  relationships?: JsonapiResourceRelationshipIdentifiers
  links?: JsonapiResourceLinks
}

type URLString = string

export type JsonapiLink =
  | URLString
  | {
      href: URLString
      meta: JsonapiMeta
    }

// GET resolves to HasOneRelationship
export type JsonapiHasOneRelationshipLink = JsonapiLink

// PATCH replaces the relationship on the server with the identified resource, or null
// http://jsonapi.org/format/#crud-updating-to-one-relationships
//
// Question: Do POST and DELETE work? This language implies yes, but it's in the
// "to-many" section: "If the client makes a DELETE request to a URL from a relationship link ..."
//
// Unspecified: Is this capability available?
export interface JsonapiPatchHasOneRelationship {
  data: JsonapiResourceIdentifier | null
}

// GET resolves to HasMayRelationship
export type JsonapiHasManyRelationshipLink = JsonapiLink

// PATCH replaces the relationship on the server with the list of identified resources
// POST adds the identified resources to the relationship
// DELETE removes the identified resources from the relationship
// http://jsonapi.org/format/#crud-updating-relationships
//
// Unspecified: Which of these capabilities is available?
// Unspecified: Uniqueness constraint violation.
export interface UpdateHasManyRelationship {
  data: JsonapiResourceIdentifier[]
}

export interface JsonapiHasOneRelationship {
  links: {
    self: JsonapiHasOneRelationshipLink
    related: JsonapiLink
  }

  data: JsonapiResourceIdentifier | null
  meta?: JsonapiMeta
}

export interface JsonapiHasManyRelationship {
  links: {
    self: JsonapiHasManyRelationshipLink
    related: JsonapiLink
  }

  data: JsonapiResourceIdentifier[]
  meta?: JsonapiMeta
}

// http://jsonapi.org/format/#document-resource-object-relationships
// "The value of the relationships key"
export type JsonapiRelationship =
  | JsonapiHasOneRelationship
  | JsonapiHasManyRelationship

export interface JsonapiError {
  id?: string
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: JsonapiErrorSource
  meta: JsonapiErrorMeta
}

export interface JsonapiErrorSource {
  pointer?: string
  parameter?: string
}

export type JsonapiErrorMeta = Record<string, any>
export type JsonapiLinks = Record<any, any>

export interface JsonapiResponseAPIMeta {
  jsonapi: {
    version?: "1.0"
    meta?: JsonapiMeta
  }
  meta?: JsonapiMeta
  links?: JsonapiLinks
}

export type JsonapiResponseDocument =
  | JsonapiResourceResponseDocument
  | JsonapiResourceListResponseDocument
  | JsonapiErrorResponseDocument

export interface JsonapiDataDocument<Data> {
  data: Data
  included: JsonapiResourceObject[]
  errors?: undefined
}

export type JsonapiResourceResponseDocument = JsonapiResponseAPIMeta &
  JsonapiDataDocument<JsonapiResourceObject>

export type JsonapiResourceListResponseDocument = JsonapiResponseAPIMeta &
  JsonapiDataDocument<JsonapiResourceObject[]>

export type JsonapiSuccessResponseDocument =
  | JsonapiResourceResponseDocument
  | JsonapiResourceListResponseDocument

export interface JsonapiErrorResponseDocument extends JsonapiResponseAPIMeta {
  data?: undefined
  included?: undefined
  errors: JsonapiError[]
}

export interface JsonapiRequestDocument {
  data: JsonapiResourceObject
}
