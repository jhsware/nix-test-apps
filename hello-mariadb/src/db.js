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
const tmpUri = CONNECTION_STRING.replace(match[2], hostParts[0]);
const baseUrlParts = new URL(tmpUri);

console.log(`Connecting to ${match[2]}`);

class Database {
  _pool = undefined;

  async connect() {
    if (!this._pool) {
      if (hostParts.length === 1) {
        this._pool = mysql.createPool(CONNECTION_STRING);
      } else {
        this._pool = mysql.createPoolCluster();
        const hostNames = ['Primary', 'Secondary_1', 'Secondary_2'];
        for (const index in hostParts) {
          const hostName = hostNames[index];
          const hostPort = hostParts[index];
          const [host, port] = hostPort.includes(':') 
            ? hostPort.split(':') 
            : [hostPort, '3306'];
  
          this._pool.add(hostName, {
            host: host,
            port: port,
            user: baseUrlParts.username,
            database: baseUrlParts.pathname.substring(1),
            password: baseUrlParts.password,
          });
        }
      }
      
    }
    
    return await this._pool.getConnection();
  }

  async close() {
    if (this._pool) {
      await this._pool.end();
      this._pool = undefined;
    }
  }

  async fetchById(id, tableName) {
    const conn = await this.connect();
    const [rows] = await conn.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`, 
      [id]
    );
    conn.release();
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
    
    conn.release();
    return {
      insertedId: result.insertId
    };
  }
}

module.exports = {
  Database
}