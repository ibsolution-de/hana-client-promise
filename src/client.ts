import {
  Connection,
  ConnectionOptions,
  createConnection
} from "@ibsolution/types-hana-client";
import { Statement } from "./";

interface IOptions extends ConnectionOptions {
  currentSchema?: string;
}

export class HanaClient {
  private static ERROR_MSG = "create hana client connection first";
  private options: IOptions;
  private connection: Connection;

  constructor(options: ConnectionOptions) {
    this.options = options;
    this.options.currentSchema = options.schema
      ? `"${options.schema}"`
      : undefined;
  }

  public async createConnection(): Promise<HanaClient> {
    return new Promise((resolve, reject) => {
      const connection = createConnection();
      this.connection = undefined;
      connection.connect(this.options, err => {
        if (err) {
          return reject(err);
        }
        this.connection = connection;
        if (
          this.options.autoCommit === true ||
          this.options.autoCommit === false
        ) {
          this.setAutoCommit(this.options.autoCommit);
        }
        resolve(this);
      });
    });
  }

  public async disconnect(): Promise<HanaClient> {
    if (!this.connection) {
      throw new Error(HanaClient.ERROR_MSG);
    }
    return new Promise((resolve, reject) => {
      this.connection.disconnect(err => {
        if (err) {
          return reject(err);
        }
        this.connection = undefined;
        resolve(this);
      });
    });
  }

  public async exec<T>(sql: string, params?: any | any[]): Promise<T> {
    if (!this.connection) {
      throw new Error(HanaClient.ERROR_MSG);
    }
    return new Promise((resolve, reject) => {
      this.connection.exec<T>(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  public async prepare(sql: string): Promise<Statement> {
    if (!this.connection) {
      throw new Error(HanaClient.ERROR_MSG);
    }
    return new Promise((resolve, reject) => {
      this.connection.prepare(sql, (err, stmt) => {
        if (err) {
          return reject(err);
        }
        const statement = new Statement(stmt);
        resolve(statement);
      });
    });
  }

  public setAutoCommit(autoCommit: boolean = false): void {
    if (!this.connection) {
      throw new Error(HanaClient.ERROR_MSG);
    }
    const result = this.connection.setAutoCommit(autoCommit);
    ///  console.log('RESTULTTTT : ', result);
    // this.connection.setAutoCommit(autoCommit);
  }

  public async commit(): Promise<void> {
    if (!this.connection) {
      throw new Error(HanaClient.ERROR_MSG);
    }
    return new Promise((resolve, reject) => {
      this.connection.commit(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public async rollback(): Promise<void> {
    if (!this.connection) {
      throw new Error(HanaClient.ERROR_MSG);
    }
    return new Promise((resolve, reject) => {
      this.connection.rollback(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}
