import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import urlBase64ToUint8Array from "../utils/urlBase64ToUint8Array";
import { getPublicKey } from "../notification";

function ProgressViewer({ fileId, setFileId = () => {} }) {
  const [percent, setPercent] = useState(null);
  const [uploadedMB, setUploadedMB] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [name, setName] = useState("Untitled file");

  useEffect(() => {
    const connect = async () => {
      const timer = setTimeout(() => {
        setFileId(null);
        window.localStorage.removeItem("uploadData");
      }, 1000 * 5);

      const uploadData = JSON.parse(
        window.localStorage.getItem("uploadData") || "null"
      );

      // setFileId(uploadData?.fileId);
      setName(uploadData?.filename);

      // if (!uploadData || fileId) return () => clearInterval(intervalId);

      let socket = new WebSocket(
        `${window.location.protocol === "http:" ? "ws" : "wss"}://${
          window.location.host
        }/websocket`
      );
      socket.onopen = () => {
        console.log("socket connected.");

        socket.send(
          JSON.stringify({
            fileId,
            type: "GET_PROGRESS",
          })
        );
      };

      socket.onmessage = (event) => {
        clearTimeout(timer);
        const data = JSON.parse(event.data);

        if (typeof data.progress === "number") {
          setPercent(data.progress);
          setUploadedMB(null);
          if (data.progress >= 100 || data.complete) {
            setIsComplete(true);
          }
        } else if (typeof data.uploadedMB === "number") {
          setUploadedMB(data.uploadedMB);
          setPercent(null);
        }

        if (data.complete) {
          setIsComplete(true);
          if (typeof data.uploadedMB === "number") {
            setUploadedMB(data.uploadedMB);
          }
        }
      };

      socket.onerror = (error) => {
        console.error("socket error!", error);
        connect();
      };

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getPublicKey()),
      });

      // Send subscription to server
      await fetch("/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, fileId }),
      });

      console.log("Subscribed to push notifications");
    };

    connect();
  }, [fileId, setFileId]);

  return (
    <div className="progress-view">
      <CircularProgressbar
        styles={buildStyles({
          pathColor: "#3587d9",
          textColor: "#3587d9",
          trailColor: "#23212f",
        })}
        value={percent != null ? percent : isComplete ? 100 : 0}
        text={
          typeof percent === "number"
            ? `${percent}%`
            : uploadedMB != null
            ? `${uploadedMB} MB`
            : "0%"
        }
      />
      {!isComplete ? (
        <div className="progress-label">
          File <span className="filename"> {name} </span> is Uploading to google
          drive...
          {uploadedMB != null && (
            <div className="progress-subtext">{uploadedMB} MB uploaded</div>
          )}
        </div>
      ) : (
        <div className="progress-label success">
          File <span className="filename"> {name} </span> is uploaded
          successfully!
          <button
            type="button"
            className="primary-btn"
            onClick={() => setFileId(null)}
          >
            Upload New File
          </button>
        </div>
      )}
    </div>
  );
}

export default ProgressViewer;
