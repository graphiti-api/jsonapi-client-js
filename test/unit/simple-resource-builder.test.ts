import { SimpleResourceBuilder, JsonapiResponseDocument } from "../../src"
import { expect } from "chai"

const builder = new SimpleResourceBuilder()

describe("SimpleResourceBuilder", () => {
  describe("#buildAttributesHash", () => {
    it("returns an object with the id and the attributes", () => {
      let attrs = builder.buildRecord({
        id: "123abc",
        type: "foo",
        attributes: {
          name: "Test",
          age: 10,
        },
      })

      expect(attrs).to.deep.eq({
        id: "123abc",
        name: "Test",
        age: 10,
      })
    })

    it("does not include relationships in the attributes", () => {
      let attrs = builder.buildRecord({
        id: "123abc",
        type: "foo",
        attributes: {},
        relationships: {
          bar: {
            data: {
              type: "others",
              id: "345",
            },
          },
        },
      })

      expect(attrs.bar).to.be.undefined
    })
  })

  describe("#buildIncludedHash", () => {
    context("when included is undefined", () => {
      it("returns an empty object", () => {
        expect(builder.buildIncludedHash({} as any)).to.deep.eq({})
      })
    })

    it.only("returns a deep hash indexed by type and id", () => {
      let responseDoc: JsonapiResponseDocument = {
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

      let result = builder.buildIncludedHash(responseDoc)

      expect(result).to.deep.eq({
        foos: {
          "1": {
            record: {
              id: "1",
              name: "first foo",
            },
          },
          "2": {
            record: {
              id: "2",
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
        },
        bars: {
          "2": {
            record: {
              id: "2",
              title: "the bar",
            },
          },
        },
      })
    })
  })
})
