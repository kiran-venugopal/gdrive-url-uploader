import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getProgress } from "../api/file";

function ProgressViewer({ fileId, setFileId = () => {} }) {
  const [percent, setPercent] = useState(0);
  const [id, setId] = useState(fileId);
  const [name, setName] = useState("MyFileNew.mp4");

  useEffect(() => {
    const intervalId = setInterval(() => {
      getProgress(id).then((data) => {
        if (!data.success) {
          setFileId(null);
          window.localStorage.removeItem("uploadData");
          return;
        }
        setPercent(data.progress);
        if (data.progress === 100) window.localStorage.removeItem("uploadData");
      });
    }, 2000);

    const uploadData = JSON.parse(
      window.localStorage.getItem("uploadData") || "null"
    );

    setFileId(uploadData?.fileId);
    setName(uploadData?.filename);

    if (!uploadData || fileId) return () => clearInterval(intervalId);
  }, [id]);

  return (
    <div className="progress-view">
      <CircularProgressbar
        styles={buildStyles({
          pathColor: "#26629e",
          textColor: "#26629e",
          trailColor: "#23212f",
        })}
        value={percent}
        text={`${percent}%`}
      />
      {percent !== 100 ? (
        <div className="progress-label">
          File <span className="filename"> {name} </span> is Uploading to google
          drive...
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
