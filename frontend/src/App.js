import { Fragment, useEffect, useState } from "react";
import { getAuthUrl, getToken } from "./api/auth";
import { upload } from "./api/file";
import "./App.css";
import FormFields from "./components/Form";
import ProgressViewer from "./components/ProgressViewer";

function App() {
  const [isBtnLoading, setBtnLoading] = useState(false);
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const uploadData = JSON.parse(
    window.localStorage.getItem("uploadData") || "{}"
  );
  const [fileId, setFileId] = useState(uploadData.fileId);

  useEffect(() => {
    const tokens = JSON.parse(window.localStorage.getItem("tokens") || "null");
    const url = new URL(window.location.href);

    const fileUrl = url.searchParams.get("url");

    const urlInput = document.getElementById("url");
    if (fileUrl && urlInput) urlInput.value = fileUrl;

    if (tokens && new Date(tokens.expiry_date) > new Date()) {
      setAuth(true);
      const userData = JSON.parse(
        window.localStorage.getItem("user") || "null"
      );
      if (userData) setUser(userData);
      return;
    } else {
      window.localStorage.removeItem("tokens");
      window.localStorage.removeItem("user");
    }

    const code = url.searchParams.get("code");

    if (code) {
      getToken(code).then((data) => {
        if (data.success) {
          window.localStorage.setItem("tokens", JSON.stringify(data.tokens));
          window.localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          setAuth(true);
        }
      });
    }
  }, []);

  async function handleAuthClick() {
    setBtnLoading(true);
    const data = await getAuthUrl();
    if (data.success) {
      window.location.href = data.authUrl;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBtnLoading(true);
    const fileName = e.target.fname.value;
    const url = e.target.url.value || "";
    const tokens = JSON.parse(window.localStorage.getItem("tokens") || "null");
    if (!tokens) {
      setAuth(false);
      setUser(null);
      return;
    }
    const data = await upload(url, fileName, tokens);
    if (data.success) {
      const urlSplitted = url.split("/");
      const fileName2 = decodeURI(
        urlSplitted[urlSplitted.length - 1].split(".")[0]
      );
      window.localStorage.setItem(
        "uploadData",
        JSON.stringify({
          fileId: data.fileId,
          filename: fileName || fileName2,
        })
      );
      setFileId(data.fileId);
    }
  }

  function handleLogout() {
    setAuth(false);
    window.localStorage.removeItem("tokens");
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("uploadData");
    setUser(null);
  }

  return (
    <form className="App" onSubmit={handleSubmit}>
      {isAuth && (
        <div
          className="account-info"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          Logged in as
          <div className="user-chip">
            <img src={user.picture} alt="" />
            {user.name}
            <div
              className="dropdown"
              style={{ display: isOpen ? "unset" : "none" }}
            >
              <div onClick={handleLogout} className="logout">
                Logout
              </div>
            </div>
          </div>
        </div>
      )}
      {fileId ? (
        <ProgressViewer fileId={fileId} setFileId={setFileId} />
      ) : (
        <FormFields
          isAuth={isAuth}
          handleAuthClick={handleAuthClick}
          isBtnLoading={isBtnLoading}
        />
      )}
    </form>
  );
}

export default App;
