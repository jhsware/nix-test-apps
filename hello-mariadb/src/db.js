const mysql = require('mysql2/promise');

const IS_PROD = process.env.NODE_ENV === "production";
const {
  CONNECTION_STRING // = "mysql://root:password@localhost:3306/test"
} = process.env;

if (IS_PROD && !CONNECTION_STRING)
  throw new Error("Missing env var CONNECTION_STRING");

const regex = /^(mysql|mariadb):\/\/.*@(.*)\/.*$/;
const match = CONNECTION_STRING.match(regex);
const hostParts = match[2].split(',');
console.log(`Connecting to ${match[2]}`);

class Database {
  _pool = undefined;

  async connect() {


    if (!this._pool) {
      if (hostParts.length === 1) {
        const hostPort = hostParts[0];
        const [host, port] = hostPort.includes(':') 
            ? hostPort.split(':') 
            : [hostPort, '3306'];
        const tmpUri = CONNECTION_STRING.replace(match[2], hostParts[0]);
        const baseUrlParts = new URL(tmpUri);
        const database = baseUrlParts.pathname.substring(1);
        const password = baseUrlParts.password;
        const user = baseUrlParts.username;
        return await mysql.createConnection({
          host,
          port,
          user,
          password,
          database,
        });
      } else {
        this._pool = mysql.createPoolCluster();
        const hostNames = ['Primary', 'Secondary_1', 'Secondary_2'];
        for (const index in hostParts) {
          const hostName = hostNames[index];
          const hostPort = hostParts[index];
          const [host, port] = hostPort.includes(':') 
              ? hostPort.split(':') 
              : [hostPort, '3306'];
          const tmpUri = CONNECTION_STRING.replace(match[2], hostParts[0]);
          const baseUrlParts = new URL(tmpUri);
          const database = baseUrlParts.pathname.substring(1);
          const password = baseUrlParts.password;
          const user = baseUrlParts.username;
          this._pool.add(hostName, {
            host,
            port,
            user,
            database,
            password,
          });
        }
      }
      return await this._pool.getConnection();
    }
  }

  async _release(conn) {
    await (this._pool ? conn.release() : conn.end());
  }

  async close() {
    if (this._pool) {
      await this._pool.end();
      this._pool = undefined;
    }
  }

  async init(cmd) {
    const conn = await this.connect();
    await conn.execute(cmd);
    await this._release(conn);
  }

  async fetchById(id, tableName) {
    const conn = await this.connect();
    const [rows] = await conn.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`, 
      [id]
    );
    await this._release(conn);
    return rows.length > 0 ? rows[0] : null;
  }

  async insert(doc, tableName) {
    const conn = await this.connect();
    const columns = Object.keys(doc).join(', ');
    const placeholders = Object.keys(doc).map(() => '?').join(', ');
    const values = Object.values(doc);
    
    const [result] = await conn.execute(
      `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    await this._release(conn);
    return {
      insertedId: result.insertId
    };
  }
}

module.exports = {
  Database
}