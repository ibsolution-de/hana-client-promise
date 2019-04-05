/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from "chai";
import { HanaClient } from "..";
import { connectionOption } from "./config";

interface CurrentUserResult {
  CURRENT_USER: string;
}

describe("Test hana connection", () => {
  const SQL_CURRENTUSER = "SELECT CURRENT_USER FROM DUMMY;";
  let client: HanaClient;

  beforeEach(() => {
    client = new HanaClient(connectionOption);
  });

  afterEach(() => {
    client = null;
  });

  it("Create connection should be successfull", async () => {
    const connection = await client.createConnection();
    expect(connection).to.be.an.instanceof(HanaClient);
    expect(connection).to.be.not.undefined;
  });

  it("Get current user SQL should provide one result", async () => {
    const connection = await client.createConnection();
    const results = await connection.exec<CurrentUserResult>(SQL_CURRENTUSER);
    expect(results).to.be.an("Array");
    expect(results).to.be.not.empty;
    expect(results).to.have.length(1);
  });

  it("Get current user SQL should provide same user as login", async () => {
    const connection = await client.createConnection();
    const results = await connection.exec<CurrentUserResult[]>(SQL_CURRENTUSER);
    const user = results[0];
    expect(user).to.be.not.empty;
    expect(user)
      .to.have.property("CURRENT_USER")
      .to.be.eq(connectionOption.uid);
  });

  it("Disconnect connection properly", async () => {
    const connection = await client.createConnection();
    await connection.disconnect();
    try {
      await connection.exec<CurrentUserResult>(SQL_CURRENTUSER);
    } catch (e) {
      expect(e)
        .to.have.property("message")
        .to.be.eq("create hana client connection first");
    }
  });
});
