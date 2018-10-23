import { JsonapiResponseDocument } from "../jsonapi-spec"

export interface IResourceBuilder {
  assembleResourceGraph<T>(
    attributes: Record<string, any>,
    relationships: any
  ): T

  buildIncludedHash(responseDoc: JsonapiResponseDocument): any
}
