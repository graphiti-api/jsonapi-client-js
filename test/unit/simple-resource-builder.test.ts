import {
  SimpleResourceBuilder,
  JsonapiResponseDocument,
  JsonapiSuccessResponseDocument,
} from "../../src"
import { expect } from "chai"
import { RecordAssociationHash } from "@/builder/resource-builder"

const builder = new SimpleResourceBuilder()

describe("SimpleResourceBuilder", () => {
  describe("#buildIntermediateData", () => {
    it("returns an object containing the record and the relationships", () => {
      let responseRecord = {
        id: "123abc",
        type: "foo",
        attributes: {
          name: "Test",
          age: 10,
        },
        relationships: {
          currentBar: {
            data: {
              id: "456",
              type: "bars",
            },
          },
          bars: {
            data: [
              {
                id: "456",
                type: "bars",
              },
              {
                id: "789",
                type: "bars",
              },
            ],
          },
        },
      }

      let {
        attributes,
        relationshipIdentifiers,
        record,
        visited,
      } = builder.buildIntermediateData(responseRecord)

      expect(attributes).to.deep.eq({
        id: "123abc",
        name: "Test",
        age: 10,
      })

      expect(relationshipIdentifiers).to.deep.eq(responseRecord.relationships)
      expect(record).to.deep.eq(attributes)
      expect(visited).to.be.false
    })
  })

  describe("#buildIntermediateResultsHash", () => {
    context("when when root data is sigular", () => {
      let rootRecord = {
        id: "123abc",
        type: "foo",
        attributes: {
          name: "Test",
          age: 10,
        },
        relationships: {
          currentBar: {
            data: {
              id: "456",
              type: "bars",
            },
          },
        },
      }

      it("includes the intermediate record in the hash", () => {
        let result = builder.buildIntermediateResultsHash({
          data: rootRecord,
        } as any)

        expect(result).to.deep.eq({
          foo: {
            "123abc": {
              attributes: {
                age: 10,
                id: "123abc",
                name: "Test",
              },
              record: {
                age: 10,
                id: "123abc",
                name: "Test",
              },
              relationshipIdentifiers: {
                currentBar: {
                  data: {
                    id: "456",
                    type: "bars",
                  },
                },
              },
              visited: false,
            },
          },
        })
      })
    })

    context("when when root data is an array", () => {
      let rootRecord = [
        {
          id: "123abc",
          type: "foo",
          attributes: {
            name: "Test",
            age: 10,
          },
          relationships: {
            currentBar: {
              data: {
                id: "456",
                type: "bars",
              },
            },
          },
        },
        {
          id: "def456",
          type: "foo",
          attributes: {
            name: "Another",
            age: 12,
          },
          relationships: {
            currentBar: {
              data: {
                id: "456",
                type: "bars",
              },
            },
          },
        },
      ]

      it("includes intermediate records for all items in the hash", () => {
        let result = builder.buildIntermediateResultsHash({
          data: rootRecord,
        } as any)

        expect(result).to.deep.eq({
          foo: {
            "123abc": {
              attributes: {
                age: 10,
                id: "123abc",
                name: "Test",
              },
              record: {
                age: 10,
                id: "123abc",
                name: "Test",
              },
              relationshipIdentifiers: {
                currentBar: {
                  data: {
                    id: "456",
                    type: "bars",
                  },
                },
              },
              visited: false,
            },
            def456: {
              attributes: {
                age: 12,
                id: "def456",
                name: "Another",
              },
              record: {
                age: 12,
                id: "def456",
                name: "Another",
              },
              relationshipIdentifiers: {
                currentBar: {
                  data: {
                    id: "456",
                    type: "bars",
                  },
                },
              },
              visited: false,
            },
          },
        })
      })
    })

    context("when there is an included hash", () => {
      it("returns a deep hash indexed by type and id", () => {
        let responseDoc: JsonapiSuccessResponseDocument = {
          data: [],
          included: [
            {
              type: "foos",
              id: "1",
              attributes: {
                name: "first foo",
              },
            },
            {
              type: "foos",
              id: "2",
              attributes: {
                name: "second foo",
              },
              relationships: {
                theBar: {
                  data: {
                    id: "2",
                    type: "bars",
                  },
                },
              },
            },
            {
              type: "bars",
              id: "2",
              attributes: {
                title: "the bar",
              },
            },
          ],
        } as any

        let result: RecordAssociationHash<
          Record<string, any>
        > = builder.buildIntermediateResultsHash(responseDoc)

        expect(result).to.deep.eq({
          foos: {
            "1": {
              attributes: {
                id: "1",
                name: "first foo",
              },
              record: {
                id: "1",
                name: "first foo",
              },
              relationshipIdentifiers: {},
              visited: false,
            },
            "2": {
              attributes: {
                id: "2",
                name: "second foo",
              },
              record: {
                id: "2",
                name: "second foo",
              },
              relationshipIdentifiers: {
                theBar: {
                  data: {
                    id: "2",
                    type: "bars",
                  },
                },
              },
              visited: false,
            },
          },
          bars: {
            "2": {
              attributes: {
                id: "2",
                title: "the bar",
              },
              record: {
                id: "2",
                title: "the bar",
              },
              relationshipIdentifiers: {},
              visited: false,
            },
          },
        })
      })
    })
    it("deep clones all attribute objects", () => {
      let rootRecord = {
        id: "123abc",
        type: "foo",
        attributes: {
          name: "Test",
          age: 10,
          someObject: {
            foo: "bar",
            baz: "zab",
          },
        },
      }

      let result = builder.buildIntermediateResultsHash({
        data: rootRecord,
      } as any)

      let deepAttr = result.foo["123abc"].attributes.someObject
      expect(deepAttr).to.deep.eq({
        foo: "bar",
        baz: "zab",
      })
      expect(deepAttr).not.to.eq(rootRecord.attributes.someObject)
    })
  })

  describe("#buildDocumentResources", () => {
    let doc: JsonapiSuccessResponseDocument

    let build = () => {
      return builder.buildDocumentResources(doc)
    }

    context("when processing a series of nested resources", () => {
      beforeEach(() => {
        doc = require("../fixtures/nested-list.json")
      })

      it("shares references across the graph", () => {
        let result = build() as Record<string, any>[]

        expect(result[0].current_position).not.to.be.undefined
        expect(result[0].current_position).to.eq(result[1].positions[0])
      })
    })

    context("when loading circular references", () => {
      beforeEach(() => {
        doc = require("../fixtures/circular-reference.json")
      })

      it("does not duplicate objects", () => {
        let result = build() as Record<string, any>[]

        expect(result[0]).not.to.be.undefined
        expect(result[0]).to.eq(result[0].manager.subordinates[0])
        expect(result[0]).to.eq(result[1].subordinates[0])
      })
    })
  })
})
