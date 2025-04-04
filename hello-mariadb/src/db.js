const mysql = require('mysql2/promise');

const IS_PROD = process.env.NODE_ENV === "production";
const {
  CONNECTION_STRING = "mysql://root:password@localhost:3306/test"
} = process.env;

if (IS_PROD && !CONNECTION_STRING)
  throw new Error("Missing env var CONNECTION_STRING");

const dbConnectionUrl = CONNECTION_STRING;

console.log(`Connecting to ${dbConnectionUrl}`);

class Database {
  _pool = undefined;

  async connect() {
    if (this._pool) return;
    this._pool = mysql.createPool(dbConnectionUrl);
  }

  async close() {
    if (this._pool) {
      await this._pool.end();
      this._pool = undefined;
    }
  }

  async fetchById(id, tableName) {
    await this.connect();
    const [rows] = await this._pool.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`, 
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async insert(doc, tableName) {
    await this.connect();
    const columns = Object.keys(doc).join(', ');
    const placeholders = Object.keys(doc).map(() => '?').join(', ');
    const values = Object.values(doc);
    
    const [result] = await this._pool.execute(
      `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    return {
      insertedId: result.insertId
    };
  }
}

module.exports = {
  Database
}