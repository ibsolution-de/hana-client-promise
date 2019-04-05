/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from 'chai';
import { HanaClient } from '..';
import { connectionOption } from './config';
import { resultProperties } from './testData';

interface TestData {
  id: number;
  appId: number;
  createdDate: Date | string;
  accessToken: string;
  refreshToken: string;
}

describe('Test statement methods', () => {
  const APP_ID = 99;
  const ACCESS_TOKEN = '123';
  const REFERESH_TOKEN = '321';
  const SQL_SELECT_STATEMENT = 'SELECT * FROM "HanaClient.Test" where "accessToken" = ?';
  const SQL_BATCH_INSERT = `INSERT INTO "HanaClient.Test" ("id", "appId", "createdDate", "accessToken", "refreshToken") VALUES ( "TestId".NEXTVAL, ${APP_ID}, now(), ?, ?);`;
  const SQL_INSERT = `INSERT INTO "HanaClient.Test" ("id", "appId", "createdDate", "accessToken", "refreshToken") VALUES ( "TestId".NEXTVAL, ${APP_ID}, now(), 123, 321);`;
  const SQL_CLEANUP_ALL: string = `DELETE FROM "HanaClient.Test" WHERE "appId" = ${APP_ID};`;

  let client: HanaClient;

  beforeEach(async () => {
    const hana = new HanaClient(connectionOption);
    client = await hana.createConnection();
    await client.exec<number>(SQL_INSERT);
  });

  afterEach(async () => {
    // Delete All Created
    await client.exec(SQL_CLEANUP_ALL);
    await client.disconnect();
    client = null;
  });

  // Test exec with predefine array return
  it('Select into Test table With Parameterized query using method exec', async () => {
    const statement = await client.prepare(SQL_SELECT_STATEMENT);
    const result = await statement.exec<TestData[]>([ACCESS_TOKEN]);
    expect(result).to.be.not.empty;
    expect(result).to.be.a('array');
    expect(result[0]).to.have.all.keys(resultProperties);
    expect(result[0].accessToken).to.be.equal(ACCESS_TOKEN);
  });

  // Test execQuery
  it('Select into Test table With Parameterized query using method execQuery', async () => {
    const statement = await client.prepare(SQL_SELECT_STATEMENT);
    const result = await statement.execQuery<TestData>([ACCESS_TOKEN]);
    expect(result).to.be.not.empty;
    expect(result).to.be.a('array');
    expect(result[0]).to.have.all.keys(resultProperties);
    expect(result[0].accessToken).to.be.equal(ACCESS_TOKEN);
  });

  // Batch query
  it('Insert into Test table With Parameterized query using method execBatch ', async () => {
    const statement = await client.prepare(SQL_BATCH_INSERT);
    const batchParamArray = [[ACCESS_TOKEN, REFERESH_TOKEN], [1234, 4321]];
    const result = await statement.execBatch<TestData[]>(batchParamArray);
    expect(result).to.be.not.null;
    expect(result).to.be.a('number');
    expect(result).to.be.equal(batchParamArray.length);
  });
});
