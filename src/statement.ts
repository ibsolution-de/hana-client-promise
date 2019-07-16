/* eslint-disable consistent-return */
import { ResultSet, Statement as HanaStatement } from '@ibsolution/types-hana-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Param = any;
type Params = Param | Param[];

/**
 * Hana Client Statement
 */
export class Statement {
  private static ERROR_MSG = 'Create statement first';

  private stmt: HanaStatement;

  public constructor(stmt: HanaStatement) {
    this.stmt = stmt;
  }

  /**
   * execute already prepared statement with parameters
   * @param params one or more values to be send with statement
   */
  public async exec<T>(params?: Params): Promise<T> {
    if (!this.stmt) {
      throw new Error(Statement.ERROR_MSG);
    }
    return new Promise((resolve, reject): void => {
      const myFn = (err: Error, results: T): void => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      };
      // eslint-disable-next-line no-unused-expressions
      params ? this.stmt.exec<T>(Array.isArray(params) ? params : [params], myFn) : this.stmt.exec<T>(myFn);
    });
  }

  /**
   * execute query statement
   * @param params one or more parameters to be send with query statement
   */
  public async execQuery<T>(params?: Params): Promise<T[]> {
    if (!this.stmt) {
      throw new Error(Statement.ERROR_MSG);
    }
    return new Promise((resolve, reject): void => {
      this.stmt.execQuery<T>(params, (err: Error, rs: ResultSet): void => {
        if (err) {
          return reject(err);
        }
        const rows = [];
        while (rs.next()) {
          rows.push(rs.getValues<T>());
        }
        resolve(rows);
      });
    });
  }

  /**
   * execute prepared statement as batch with given list of parameters
   * @param params multiple parameters to be send as back for prepared query
   */
  public async execBatch<T>(params: Params[]): Promise<T> {
    if (!this.stmt) {
      throw new Error(Statement.ERROR_MSG);
    }
    return new Promise((resolve, reject): void => {
      this.stmt.execBatch<T>(params, (err, results): void => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  /**
   * drop statement
   */
  public async drop(): Promise<void> {
    if (!this.stmt) {
      throw new Error(Statement.ERROR_MSG);
    }
    return new Promise((resolve, reject): void => {
      this.stmt.drop((err): void => (err ? reject(err) : resolve()));
    });
  }
}
