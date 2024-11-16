const { createClient } = require('redis');
// https://redis.io/docs/latest/develop/clients/nodejs/
const IS_PROD = process.env.NODE_ENV === "production";
const {
  CONNECTION_STRING = "redis://localhost:6380"
} = process.env;

if (IS_PROD && !CONNECTION_STRING)
  throw new Error("Missing env var CONNECTION_STRING");

console.log(`Connecting to ${CONNECTION_STRING}`);

class Database {
  _client = undefined;

  async connect() {
    if (!this._client) {
      this._client ??= createClient({
        url: CONNECTION_STRING
      });
      this._client.on('error', err => console.log('Redis Client Error', err))
      await this._client.connect();
    }
  }

  async close() {
    await this._client?.disconnect();
  }

  async fetchById(key) {
    await this.connect();
    const value = await client.get(key);
    return value;
  }

  async insert(key, value) {
    await this.connect();
    await this._client.set(key, value);
  }
}

module.exports = {
  Database
}

