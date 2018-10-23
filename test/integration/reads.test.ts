import { JsonapiError, Client } from "../../src/index"
import { expect } from "chai"

import axios from "axios"
import MockAdapter from "axios-mock-adapter"

const mock = new MockAdapter(axios)

let client = new Client()

describe("Simple resource lookup", () => {
  describe("Single Resource", () => {
    const stubResponse = require("../fixtures/simple-resource.json")
    const resourceUrl = "http://example.com/v1/employee/1"

    beforeEach(() => {
      mock.onGet(resourceUrl).reply(200, stubResponse)
    })

    it("Builds an object of the record", async () => {
      let employee = await client.get(resourceUrl)

      expect(employee).to.deep.eq({
        id: "12345",
        first_name: "Frank",
        last_name: "Abagnale",
        age: 17,
      })
    })
  })

  describe("Multiple Resources", () => {
    const stubResponse = require("../fixtures/simple-list.json")
    const resourceUrl = "http://example.com/v1/employees"

    beforeEach(() => {
      mock.onGet(resourceUrl).reply(200, stubResponse)
    })

    it("Builds a list of record objects", async () => {
      let employee = await client.getList(resourceUrl)

      expect(employee).to.deep.eq([
        {
          id: "12345",
          first_name: "Frank",
          last_name: "Abagnale",
          age: 17,
        },
        {
          id: "6789",
          first_name: "Frank",
          last_name: "Conners",
          age: 21,
        },
      ])
    })
  })
})

describe("Nested Resource Lookup", () => {
  describe("Single Resource with nested association", () => {
    const stubResponse = require("../fixtures/nested-resource.json")
    const resourceUrl =
      "http://example.com/v1/employee/1?include=current_position"

    beforeEach(() => {
      mock.onGet(resourceUrl).reply(200, stubResponse)
    })

    it("Builds an object of the record", async () => {
      let employee = await client.get(resourceUrl)

      expect(employee.first_name).to.eq("Frank")
      expect(employee.current_position).to.deep.eq({
        id: "1",
        title: "Student",
      })
    })
  })

  describe("Multiple Resources with nested associations", () => {
    const stubResponse = require("../fixtures/nested-list.json")
    const resourceUrl =
      "http://example.com/v1/employees?include=positions,current_position"

    beforeEach(() => {
      mock.onGet(resourceUrl).reply(200, stubResponse)
    })

    it("Builds a list of record objects", async () => {
      let employee = await client.getList(resourceUrl)

      expect(employee).to.deep.eq([
        {
          id: "12345",
          first_name: "Frank",
          last_name: "Abagnale",
          age: 17,
        },
        {
          id: "6789",
          first_name: "Frank",
          last_name: "Conners",
          age: 21,
        },
      ])
    })
  })
})
