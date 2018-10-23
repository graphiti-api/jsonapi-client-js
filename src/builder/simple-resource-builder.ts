import { ResourceBuilder } from "./resource-builder"
import {
  JsonapiResponseDocument,
  JsonapiResourceObject,
  JsonapiResourceRelationships,
} from "../jsonapi-spec"

export type IncludedHash = {
  [type: string]: {
    [id: string]: RecordRelationshipPair
  }
}
export type RecordRelationshipPair = {
  record: Record<string, any>
  relationships?: JsonapiResourceRelationships
}

export class SimpleResourceBuilder extends ResourceBuilder {
  assembleResourceGraph<T>(
    attributes: Record<string, any>,
    IncludedHash: IncludedHash
  ) {
    return attributes as T
  }

  buildIncludedHash(responseDoc: JsonapiResponseDocument): IncludedHash {
    if (!responseDoc.included) {
      return {}
    }

    let hash: IncludedHash = {}

    responseDoc.included.forEach(item => {
      let type = item.type
      let attrs = this.buildRecord(item)
      let typeGroup = hash[type]

      if (!typeGroup) {
        typeGroup = hash[type] = {}
      }

      let result: RecordRelationshipPair = {
        record: attrs,
      }
      if (item.relationships) {
        result.relationships = item.relationships
      }
      typeGroup[item.id as string] = result
    })

    return hash
  }

  buildRecord(resourceResponse: JsonapiResourceObject): Record<string, any> {
    let attrs = {
      id: resourceResponse.id as string,
      ...resourceResponse.attributes,
    }

    return attrs
  }
}
