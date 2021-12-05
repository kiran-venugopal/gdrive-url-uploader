import React, { Fragment } from "react";
import { ReactComponent as DriveIcon } from "../icons/drive.svg";

function FormFields({ isAuth, isBtnLoading, handleAuthClick }) {
  return (
    <Fragment>
      <div className="input-field">
        <label htmlFor="url"> File URL </label>
        <input
          required
          id="url"
          placeholder="eg: https://example.com/my-file.mp4"
          name="url"
        />
      </div>
      <div className="input-field">
        <label htmlFor="fname">
          {" "}
          File name &nbsp; <small> ( optional ) </small>{" "}
        </label>
        <input id="fname" placeholder="eg: my file" name="fname" />
      </div>
      <div className="initial-message">
        {isAuth ? (
          <button disabled={isBtnLoading} className="primary-btn success">
            <DriveIcon />
            Upload to Google Drive
          </button>
        ) : (
          <Fragment>
            <button
              disabled={isBtnLoading}
              onClick={handleAuthClick}
              className="primary-btn"
              type="button"
            >
              <DriveIcon />
              Authorize Google Drive
            </button>
            <p>
              You need authorize this app to upload file to google drive from
              your url
            </p>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

export default FormFields;
