const { Collection, MongoClient, ObjectId } = require('mongodb');

const IS_PROD = process.env.NODE_ENV === "production";
const {
  CONNECTION_STRING = "mongodb://127.0.0.1:27017/test"
} = process.env;

if (IS_PROD && !CONNECTION_STRING)
  throw new Error("Missing env var CONNECTION_STRING");


const dbConnectionUrl = CONNECTION_STRING;

console.log(`Connecting to ${dbConnectionUrl}`);

class Database {
  _client = undefined;

  async connect() {
    if (this._client) return;
    const mongoClient = new MongoClient(dbConnectionUrl);
    this._client = await mongoClient.connect();
  }

  async close() {
    if (this._client) await this._client.close();
    this._client = undefined;
  }

  async fetchById(id, collectionName) {
    await this.connect();
    const collection = this._client.db().collection(collectionName);
    const doc = await collection.findOne({ id });
    return doc;
  }

  async insert(doc, collectionName) {
    await this.connect();
    const collection = this._client.db().collection(collectionName);
    const res = await collection.insertOne({ ...doc });
  }
}

module.exports = {
  Database
}