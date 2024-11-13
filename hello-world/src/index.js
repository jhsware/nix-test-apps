const express = require('express');

const PORT = 3010;

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
  '/hello',
  async (req, res, next) => {
    try {
      res.send('hello world!');
    } catch (err) {
      next(err);
    }
  }
);

api.get(
  '/env',
  async (req, res, next) => {
    try {
      res.send(JSON.stringify(process.env));
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
