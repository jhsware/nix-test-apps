const { Client } = require('@elastic/elasticsearch');
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
const IS_PROD = process.env.NODE_ENV === "production";
const {
  CONNECTION_STRING = "http://localhost:9200"
} = process.env;

if (IS_PROD && !CONNECTION_STRING)
  throw new Error("Missing env var CONNECTION_STRING");

console.log(`Connecting to ${CONNECTION_STRING}`);

class Database {
  _client = undefined;

  async connect() {
    if (this._client) return;
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html
    this._client ??= new Client({
      node: CONNECTION_STRING,
    });
  }

  async close() {
    if (this._client) await this._client.close();
    this._client = undefined;
  }

  async fetchById(id, index) {
    await this.connect();
    return this._client.get({ id, index });
  }

  async insert(doc, index) {
    await this.connect();

    if (!await this._client.indices.exists({ index })) {
      await this._client.indices.create({ index });
    }

    await this._client.create({ id, index });
  }
}

module.exports = {
  Database
}