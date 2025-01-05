const express = require("express");
require("dotenv").config();
const cors = require(`cors`);
var bodyParser = require(`body-parser`);
const router = require("./routes/router.js");

const app = express();

app.use(
  cors({
    origin: `*`,
    credentials: true,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json({ limit: `50mb` }));

app.use("/", router);

app.listen(process.env.PORT || 3000, () => {
  const host = process.env.HOST,
    port = process.env.PORT;
  console.log(`Server listening at http://${host}:${port}`);
});
