import { ResourceBuilder } from "./resource-builder"

export class SimpleResourceBuilder<
  T extends Record<string, any>
> extends ResourceBuilder<T> {
  buildRecord(type: string, attributes: Record<string, any>): T {
    return { ...attributes } as T
  }

  assignAssociations(record: T, associations: Record<string, T | T[]>) {
    Object.keys(associations).forEach(key => {
      record[key] = associations[key]
    })
  }
}
