const express = require("express");
const bodyParser = require("body-parser");
const { getToken, authorize } = require("./resolvers/auth-resolvers");
const { uploadToGDrive, getProgress } = require("./resolvers/file-resolvers");
const cors = require("cors");

// global variable
global.fileMeta = {};

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is started in port ${PORT}`);
});

app.use(express.static("frontend/build"));

app.get("/progress", getProgress);

app.post("/upload", uploadToGDrive);

app.get("/authorize", authorize);

app.get("/token", getToken);
