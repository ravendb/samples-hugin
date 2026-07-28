import { useState } from "react";
import PropTypes from "prop-types";
import { isInternetAvailable } from "../services/availability.service";

export function ExternalLink({ href, children, className }) {
  const [offline, setOffline] = useState(false);

  async function open(event) {
    event.preventDefault();
    if (await isInternetAvailable()) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      setOffline(true);
    }
  }

  return (
    <>
      <a href={href} className={className} onClick={open}>{children}</a>
      {offline && (
        <div className="external-link-popup" role="dialog" aria-modal="true">
          <div className="card bg-faded-interactive external-link-card">
            <div className="card-body text-center text-light">
              <h3>External link unavailable</h3>
              <p>Hugin&apos;s access point is offline by design. Switch Wi-Fi networks before opening this website.</p>
              <button className="btn btn-secondary" onClick={() => setOffline(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
