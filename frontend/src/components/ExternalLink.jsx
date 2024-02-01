import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { useDispatch } from "react-redux";

export function ExternalLink({ href, children }) {
  const [showPopup, setShowPopup] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState("loading");
  const dispatch = useDispatch();

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

  const openPopup = (e) => {
    if (onlineStatus !== "online") {
      e.preventDefault();
      setShowPopup(true);
    }
    else {
      setShowPopup(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const openExternalLink = () => {
    closePopup();
  };

  const portalContainer = document.createElement('div');

  useEffect(() => {
    document.body.appendChild(portalContainer);

    return () => {
      document.body.removeChild(portalContainer);
    };
  }, [portalContainer]);

  const popupPortal = showPopup
    ? ReactDOM.createPortal(
      <div className="external-link-popup">
        <div className='card bg-faded-interactive external-link-card'>
          <div className='card-body text-center text-light'>
            <h3>Opening an external link</h3>
            <img src={"./img/switch-wifi.svg"} className='img-fluid my-3' />
            <p className='lead'>By default Hugin's WiFi is not connected to the Internet. Disconnect from Hugin's WiFi and connect to the normal network to and click <strong className='text-emphasis'>Open external website</strong>. </p>
            <div className='hstack gap-3 justify-content-center flex-wrap-1 mt-4'>
              <button onClick={closePopup} className='btn btn-secondary btn-lg'>Cancel</button>
              <a href={href} className='btn btn-interactive btn-lg' target="_blank" onClick={openExternalLink}>Open external website</a>
            </div>
          </div>
        </div>
      </div>,
      portalContainer
    )
    : null;

  return (
    <>
      <a href={href} onClick={openPopup} target="_blank">
        {children}
      </a>
      {popupPortal}
    </>
  );
}

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};