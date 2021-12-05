const { google } = require("googleapis");
const { oauthClient, SCOPES } = require("../gdrive-api/config");

async function getToken(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(400);
      return res.json({
        success: false,
        message: "Request failed! expected query code is missing.",
      });
    }

    const oauth_data = await new Promise((resolve, rej) => {
      oauthClient.getToken(code, (err, token) => {
        if (err) {
          rej(err);
          return;
        }
        oauthClient.setCredentials(token);
        const v2Client = google.oauth2({
          auth: oauthClient,
          version: "v2",
        });

        v2Client.userinfo.get((err, res) => {
          if (err) {
            resolve(token);
            return;
          }
          resolve({ tokens: token, user: res.data });
        });
      });
    });

    // not sending the refresh token
    delete oauth_data.tokens.refresh_token;

    return res.json({ success: true, ...oauth_data });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: err.message });
  }
}

async function authorize(req, res) {
  try {
    const authUrl = oauthClient.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    return res.json({ success: true, authUrl });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getToken,
  authorize,
};
