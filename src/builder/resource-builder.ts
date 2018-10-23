import { JsonapiResponseDocument } from "../jsonapi-spec"

export abstract class ResourceBuilder {
  abstract assembleResourceGraph<T>(
    attributes: Record<string, any>,
    relationships: any
  ): T

  abstract buildIncludedHash(responseDoc: JsonapiResponseDocument): any
}
