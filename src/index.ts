import Axios, { AxiosResponse, AxiosInstance } from "axios"
import {
  JsonapiResponseDocument,
  JsonapiResourceObject,
  JsonapiResourceResponseDocument,
  JsonapResourceListResponseDocument,
} from "./jsonapi-spec"

import { ResourceBuilder } from "./builder/resource-builder"
import { SimpleResourceBuilder } from "./builder/simple-resource-builder"

export * from "./jsonapi-spec"

export {
  SimpleResourceBuilder,
  ResourceBuilder
}

export class Client {
  private _adapter: HTTPAdapter
  private _builder: ResourceBuilder

  constructor(opts?: { adapter?: HTTPAdapter; builder?: ResourceBuilder }) {
    opts = opts || {}

    this._adapter = opts.adapter || new AxiosAdapter()
    this._builder = opts.builder || new SimpleResourceBuilder()
  }

  async get<T = Record<string, any>>(url: string) {
    let response = await this._adapter.get<JsonapiResponseDocument>(url)
    let doc = response.data as JsonapiResourceResponseDocument
    let relationships = this._builder.buildIncludedHash(doc)
    // return this._builder.buildResource<T>(doc.data)
  }

  async getList<T = Record<string, any>>(url: string) {
    let response = await this._adapter.get<JsonapiResponseDocument>(url)
    let doc = response.data as JsonapResourceListResponseDocument
    // return doc.data.map(item => this._builder.buildResource<T>(item))
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
