declare module 'sql.js' {
  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }
  export interface Database {
    exec(sql: string): QueryExecResult[];
    run(sql: string): void;
    close(): void;
  }
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }
  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
  }
  const initSqlJs: (config?: InitSqlJsConfig) => Promise<SqlJsStatic>;
  export default initSqlJs;
}
