const express = require("express");
const bodyParser = require("body-parser");
const { getToken, authorize } = require("./resolvers/auth-resolvers");
const { uploadToGDrive, getProgress } = require("./resolvers/file-resolvers");
const cors = require("cors");
const { setupWebSocket } = require("./resolvers/socket");
const webPush = require("web-push");

// global variable
global.fileMeta = {};
global.notificationSubs = new Map();

const app = express();
const server = setupWebSocket(app);

app.use(bodyParser.json());
app.use(cors());

// Configure web-push with VAPID keys
webPush.setVapidDetails(
  process.env.vapid_email,
  process.env.vapid_public,
  process.env.vapid_private
);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is started in port ${PORT}`);
});

app.use(express.static("frontend/build"));

app.get("/progress", getProgress);

app.post("/upload", uploadToGDrive);

app.get("/authorize", authorize);

app.get("/token", getToken);

// Endpoint to get public VAPID key
app.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.vapid_public });
});

// Endpoint to save subscription
app.post("/subscribe", (req, res) => {
  const { subscription, fileId } = req.body;

  // Save subscription (store in database in production)
  global.notificationSubs.set(fileId, subscription);

  console.log("New subscription:", { fileId, subscription });
  res.status(201).json({ message: "Subscription saved" });
});
