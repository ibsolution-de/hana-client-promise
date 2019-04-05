/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from "chai";
import { HanaClient } from "..";
import { connectionOption } from "./config";

describe("Test hana connection exceptions", () => {
  let client: HanaClient;

  beforeEach(() => {
    // clone connection options
    const options = { ...connectionOption };
    options.pwd = "X";
    client = new HanaClient(options);
  });

  afterEach(() => {
    client = null;
  });

  it("Create connection with wrong password should throw error with code 10", async () => {
    try {
      await client.createConnection();
    } catch (e) {
      expect(e)
        .to.have.property("code")
        .to.be.eq(10);
    }
  });

  it("Create connection with wrong password should throw error with message", async () => {
    try {
      await client.createConnection();
    } catch (e) {
      expect(e)
        .to.have.property("message")
        .to.be.eq("authentication failed");
    }
  });

  it("Create connection with wrong host should lead to proper error code", async () => {
    const conn = new HanaClient({
      pwd: "",
      serverNode: "notexisting.host:34014",
      uid: ""
    });
    try {
      await conn.createConnection();
    } catch (e) {
      expect(e)
        .to.have.property("code")
        .to.be.eq(-10709);
    }
  });

  it("Create connection with wrong user should lead to proper error code", async () => {
    const options = { ...connectionOption };
    options.uid = "X";
    const conn = new HanaClient(options);
    try {
      await conn.createConnection();
    } catch (e) {
      expect(e)
        .to.have.property("code")
        .to.be.eq(10);
    }
  });
});
