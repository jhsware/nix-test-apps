const express = require('express');
const { Database } = require('./db');

const PORT = process.env.EXPOSE ?? 3010;

const app = express();
const api = express.Router();

api.get(
  '/ping',
  async (req, res, next) => {
    try {
      res.send('pong');
    } catch (err) {
      next(err);
    }
  }
);

api.get(
  '/db/:id',
  async (req, res, next) => {
    try {
      const db = new Database();
      const id = req.params.id;
      console.log(req.params);
      const doc = await db.fetchById(id, "test");
      console.log(doc);
      res.send(doc.message);
    } catch (err) {
      next(err);
    }
  }
);

api.get(
  '/db',
  async (req, res, next) => {
    try {
      const db = new Database();
      const id = req.query.id;
      const message = req.query.message;
      console.log(req.query);
      if (!id || !message) {
        throw new Error("Missing id or message");
      }
      const doc = await db.insert({ id, message }, "test");
      res.send(id);
    } catch (err) {
      next(err);
    }
  }
);


function loggingHandler(
  req,
  res,
  next
) {
  console.log(`=> ${req.path}`);
  next();
  res.on("finish", () => {
    console.log(`<= status: ${res.statusCode}`);
  });
}

app.use(loggingHandler);
app.use(api);
// app.use(localErrorHandler);

app.listen(PORT, () => {
  console.info(`Listening on port ${PORT}`);
});
