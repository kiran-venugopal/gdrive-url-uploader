const { google } = require("googleapis");
const { oauth2 } = require("googleapis/build/src/apis/oauth2");
require("dotenv").config();

const { client_id, client_secret, redirect_uri } = process.env;
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const oauthClient = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

const v2Client = google.oauth2({
  auth: oauthClient,
  version: "v2",
});

module.exports = {
  oauthClient,
  SCOPES,
  v2Client,
};
