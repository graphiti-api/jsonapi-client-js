import Axios, { AxiosResponse, AxiosInstance } from "axios"
import {
  JsonapiResponseDocument,
  JsonapiResourceObject,
  JsonapiResourceResponseDocument,
  JsonapiResourceListResponseDocument,
} from "./jsonapi-spec"

import { IResourceBuilder } from "./builder/resource-builder"
import { SimpleResourceBuilder } from "./builder/simple-resource-builder"

export * from "./jsonapi-spec"

export { SimpleResourceBuilder, IResourceBuilder }

export class Client {
  private _adapter: HTTPAdapter
  private _builder: IResourceBuilder<any>

  constructor(opts?: {
    adapter?: HTTPAdapter
    builder?: IResourceBuilder<any>
  }) {
    opts = opts || {}

    this._adapter = opts.adapter || new AxiosAdapter()
    this._builder = opts.builder || new SimpleResourceBuilder()
  }

  async get<T = Record<string, any>>(url: string): Promise<any> {
    let response = await this._adapter.get<JsonapiResponseDocument>(url)
    let doc = response.data as JsonapiResourceResponseDocument
    return this._builder.buildDocumentResources(doc)
  }

  async getList<T = Record<string, any>>(url: string) {
    let response = await this._adapter.get<JsonapiResponseDocument>(url)
    let doc = response.data as JsonapiResourceListResponseDocument
    return this._builder.buildDocumentResources(doc)
  }
}

export interface HTTPResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  request?: any
}

export abstract class HTTPAdapter {
  abstract get<T>(url: string): Promise<HTTPResponse<T>>
}

export class AxiosAdapter extends HTTPAdapter {
  private axios: AxiosInstance = Axios

  async get(url: string) {
    return await this.axios.get(url)
  }
}
