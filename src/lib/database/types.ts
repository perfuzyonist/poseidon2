export type Row = Record<string, unknown>;
export interface Connection {
  query(sql: string, params?: unknown[]): Promise<Row[]>;
}
export interface Adapter extends Connection {
  transaction<T>(work: (connection: Connection) => Promise<T>): Promise<T>;
}
