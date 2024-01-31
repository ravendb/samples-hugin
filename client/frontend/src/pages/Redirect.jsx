import "../styles/pages/home-page.css";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function Redirect() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [onlineStatus, setOnlineStatus] = useState("loading");
  useEffect(() => {
    function checkConnectivity() {
      fetch("http://google.com/generate_204", { mode: "no-cors" })
        .then((a) => setOnlineStatus("online"))
        .catch(err => {
          setTimeout(checkConnectivity, 2500);
          setOnlineStatus("offline");
        });
    }
    checkConnectivity();
  }, [dispatch]);

  function renderMessage() {
    switch (onlineStatus) {
      case "loading": {
        return (
          <div className="loading">
            <h1>Checking network connectivity...</h1>
            <p>Checking if you are online and can redirect to:</p>
            <p><a href={searchParams.get("url")}>{searchParams.get("url").split(/[?#]/)[0]}</a></p>
            <p>You may not be able to if you are running in an offline mode</p>
          </div>
        );
      }
      case "offline": {
        return (
          <div className="offline">
            <h1>You are currently offline</h1>
            <p>Cannot redirect you to the following link as you are currently offline:</p>
            <p><a href={searchParams.get("url")}>{searchParams.get("url").split(/[?#]/)[0]}</a></p>
            <p>Your device is connected to Hugin's internal network and you need to connect to your usual network to access the internet and view this page.
            </p>
          </div>
        );
      }
      case "online": {
        window.location = searchParams.get("url");
        return (
          <div className="redirecting">
            <h1>Redirecting...</h1>
            <p>Now redirecting you to...</p>
            <p><a href={searchParams.get("url")}>{searchParams.get("url").split(/[?#]/)[0]}</a></p>
          </div>
        )
      }
    }
  }

  return (
    <main className="home-page">
      <div className="info-container container my-6">
        <div className="row">
          <div className="col-lg-8">
            <div className="info-col left-col">
              <div className="card info-card">
                {renderMessage()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Redirect;
