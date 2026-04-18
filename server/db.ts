import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

function parseOdbcString(connStr: string): sql.config {
  const parts: Record<string, string> = {};

  for (const segment of connStr.split(';')) {
    const eqIdx = segment.indexOf('=');
    if (eqIdx === -1) continue;
    const key = segment.substring(0, eqIdx).trim().toUpperCase();
    const value = segment.substring(eqIdx + 1).trim();
    if (key) parts[key] = value;
  }

  const serverPart = parts['SERVER'] ?? '';
  const commaIdx = serverPart.lastIndexOf(',');
  const serverHost = commaIdx !== -1 ? serverPart.substring(0, commaIdx) : serverPart;
  const serverPort = commaIdx !== -1 ? parseInt(serverPart.substring(commaIdx + 1), 10) : 1433;

  return {
    server: serverHost,
    port: serverPort,
    database: parts['DATABASE'],
    user: parts['UID'],
    password: parts['PWD'],
    requestTimeout: 15000,
    connectionTimeout: 15000,
    options: {
      encrypt: (parts['ENCRYPT'] ?? 'yes').toLowerCase() !== 'no',
      trustServerCertificate: (parts['TRUSTSERVERCERTIFICATE'] ?? 'no').toLowerCase() === 'yes',
    },
  };
}

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;

  const connStr = process.env.SQL_SERVER_CONN;
  if (!connStr) throw new Error('SQL_SERVER_CONN environment variable is not set');

  const config = parseOdbcString(connStr);
  pool = await sql.connect(config);
  return pool;
}
