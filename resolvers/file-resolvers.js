const { default: axios } = require("axios");
const { google } = require("googleapis");
const { oauthClient } = require("../gdrive-api/config");
const { getRandomId } = require("../utils");
const { fileClients } = require("./socket");
const webPush = require("web-push");

async function uploadToGDrive(req, res) {
  const { tokens, url, filename } = req.body;

  try {
    oauthClient.setCredentials(tokens);
    const drive = google.drive({
      version: "v3",
      auth: oauthClient,
    });
    await drive.files.list();

    const fileId = getRandomId();
    fileMeta[fileId] = { progress: 0 };

    let length = 0;
    const pathname = new URL(url).pathname;
    const filename_from_url = pathname.split("/").pop() || "file";
    const urlExt = filename_from_url.includes(".")
      ? filename_from_url.split('.').pop()
      : null;

    const response = await axios.get(url, {
      responseType: "stream",
    });
    console.log(`started dowload of file: ${url}`);

    const total_length = parseInt(response.headers["content-length"]);

    response.data.on("data", async (chunk) => {
      try {
        length += chunk.length;
        let percentCompleted = Math.floor((length / total_length) * 100);

        fileMeta[fileId].progress = percentCompleted;

        fileClients.get(fileId)?.forEach?.((client) => {
          if (client.readyState === 1) {
            // OPEN
            client.send(
              JSON.stringify({
                fileId: fileId,
                timestamp: Date.now(),
                progress: percentCompleted,
              })
            );
          }
        });

        if (percentCompleted === 100) {
          // remove from global state after 30 minutes
          setTimeout(() => {
            delete fileMeta[fileId];
          }, 30 * 60 * 1000);
          console.log(`completed upload of file: ${pathname}`);

          fileClients.get(fileId)?.forEach?.((client) => client.terminate());

          const payload = JSON.stringify({
            title: "File uploaded successfully!",
            body: `${
              filename || filename_from_url
            } is uploaded successfully to google drive.`,
            icon: "/favicon.svg",
            url: "/",
          });

          const fileSubscriber = global.notificationSubs.get(fileId);

          console.log("sending notification", { fileId, fileSubscriber });

          webPush.sendNotification(fileSubscriber, payload).catch((err) => {
            // Remove invalid subscriptions
            if (err.statusCode === 410) {
              const index = subscriptions.indexOf(sub);
              if (index > -1) subscriptions.splice(index, 1);
            }
            throw err;
          });
        }
      } catch (err) {
        console.log(`error while downloading of file: ${pathname}`);
        console.log(err);
      }
    });

    const contentType = response.headers["content-type"];
    const headerExt = contentType
      ? contentType.split("/").pop().split(";")[0]
      : null;
    const finalExt = urlExt || headerExt || "bin";

    const uploadName = filename
      ? filename.includes('.')
        ? filename
        : `${filename}.${finalExt}`
      : filename_from_url;

    drive.files.create({
      requestBody: {
        name: uploadName,
        mimeType: contentType,
      },
      media: {
        mimeType: contentType,
        body: response.data,
      },
    });

    return res.json({ success: true, url, fileId });
  } catch (err) {
    console.log("uploadToGDrive: error ", err);
    return res.json({ success: false, message: err.message });
  }
}

async function getProgress(req, res) {
  const { fileId } = req.query;

  if (!fileId) {
    res.status(400);
    return res.json({
      success: false,
      message: "Request failed! expected fileId is missing.",
    });
  }
  if (fileMeta[fileId]) {
    return res.json({
      success: true,
      progress: fileMeta[fileId].progress,
    });
  }
  res.status(404);
  return res.json({
    success: false,
    message: "file not found",
  });
}

module.exports = {
  uploadToGDrive,
  getProgress,
};
