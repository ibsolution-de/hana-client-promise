/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from "chai";
import { HanaClient } from "..";
import { connectionOption } from "./config";

interface CurrentUserResult {
  CURRENT_USER: string;
}

interface TestData {
  id: number;
  appId: number;
  createdDate: Date | string;
  accessToken: string;
  refreshToken: string;
}

describe("Test hana client methods", () => {
  const APP_ID = 99;
  const SQL_SELECT = 'SELECT * FROM "HanaClient.Test";';

  const SQL_INSERT = `INSERT INTO "HanaClient.Test" ("id", "appId", "createdDate", "accessToken", "refreshToken") VALUES ( "TestId".NEXTVAL, ${APP_ID}, now(), 123, 321);`;
  const SQL_INSERT_EXTRA = `INSERT INTO "HanaClient.Test" ("id", "appId", "createdDate", "accessToken", "refreshToken") VALUES ( "TestId".NEXTVAL, ${APP_ID}, now(), 1234, 321);`;

  const SQL_CLEANUP: string[] = [
    `DELETE FROM "HanaClient.Test" WHERE "appId" = ${APP_ID} AND "accessToken" = 123 and "refreshToken" = 321;`,
    `DELETE FROM "HanaClient.Test" WHERE "appId" = ${APP_ID} AND "accessToken" = 1234 and "refreshToken" = 321;`
  ];

  let client: HanaClient;

  beforeEach(async () => {
    const hana = new HanaClient(connectionOption);
    client = await hana.createConnection();
    await client.exec<number>(SQL_INSERT);
  });

  afterEach(async () => {
    await Promise.all(
      SQL_CLEANUP.map(async sql => {
        await client.exec(sql);
      })
    );
    await client.disconnect();
    client = null;
  });

  it("insert into Test table", async () => {
    const results = await client.exec<number>(SQL_INSERT_EXTRA);
    expect(results).to.be.a("number");
    expect(results).to.be.eq(1);
  });

  it("select into Test table", async () => {
    const results = await client.exec<TestData[]>(SQL_SELECT);
    expect(results).to.be.a("Array");
    expect(results).to.be.length.gte(1);
    const data = results[0];
    expect(data).to.be.a("Object");
    expect(data)
      .to.have.property("appId")
      .to.be.equal(APP_ID);
    expect(new Date(data.createdDate)).to.be.an("date");
  });
});
