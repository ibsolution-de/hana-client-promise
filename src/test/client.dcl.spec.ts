// tslint:disable:no-unused-expression
import { expect } from "chai";
import { HanaClient } from "..";
import { connectionOption } from "./config";

interface ITestData {
  id: number;
  appId: number;
  createdDate: Date | string;
  accessToken: string;
  refreshToken: string;
}

describe("Test Data Control Method Like: Rollback and Commit", () => {
  const APP_ID = 99;
  const ACCESS_TOKEN = "999";
  const REFERESH_TOKEN = "9999";
  const SQL_INSERT = `INSERT INTO "HanaClient.Test" ("id", "appId", "createdDate", "accessToken", "refreshToken") VALUES ( "TestId".NEXTVAL, ${APP_ID}, now(), 999, 9999);`;
  const SQL_CLEANUP_ALL: string = `DELETE FROM "HanaClient.Test" WHERE "appId" = ${APP_ID};`;
  const SQL_TEST_SELECT = `SELECT * FROM "HanaClient.Test" WHERE  "accessToken"= ${ACCESS_TOKEN} AND "refreshToken"=${REFERESH_TOKEN} `;

  let client: HanaClient;
  let parallerClient: HanaClient;

  beforeEach(async () => {
    const hana = new HanaClient(connectionOption);
    client = await hana.createConnection();
    parallerClient = await hana.createConnection();
  });

  afterEach(async () => {
    // Delete All Created
    const result = await client.exec(SQL_CLEANUP_ALL);
    await parallerClient.disconnect();
    await client.disconnect();
    client = null;
    parallerClient = null;
  });

  // exec with predefine single return TODO Check type packing
  it.only("Test Commit Flow", async () => {
    // second viewer
    const selectStatement = await parallerClient.prepare(SQL_TEST_SELECT);

    // Turning off autocommit
    await client.setAutoCommit(false);
    await client.exec<number>(SQL_INSERT);

    // view for second viewer before commit
    const beforeCommit = await selectStatement.exec<ITestData[]>();
    const commit = await client.commit();

    // view for second view after commit
    const afterCommit = await selectStatement.exec<ITestData[]>();
    expect(afterCommit).to.be.not.empty;
    expect(afterCommit.length).to.be.gt(beforeCommit.length);
  });

  // exec with predefine single return TODO Check type packing
  it("Test Rollback flow", async () => {
    // second viewer
    const selectStatement = await parallerClient.prepare(SQL_TEST_SELECT);
    // Turning off autocommit
    await client.setAutoCommit(false);
    await client.exec<number>(SQL_INSERT);
    // view for second viewer before commit
    const beforeRollback = await selectStatement.exec<ITestData[]>();
    // Rollback
    await client.rollback();

    // view for second view after commit
    const afterRollback = await selectStatement.exec<ITestData[]>();

    expect(afterRollback.length).to.be.equal(beforeRollback.length);
  });
});
