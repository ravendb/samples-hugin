/* eslint-disable react/prop-types */
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../styles/components/code-modal.css";

function CodeModal({ code, onClose }) {

  function onKeyDown(e) {
    if (e.key == "Escape") {
      closeModal();
    }
  }

  document.addEventListener("keydown", onKeyDown, false);

  function closeModal() {
    document.removeEventListener("keydown", onKeyDown, false);
    onClose();
  }

  return (
    <>
      <div className="code-modal-main-screen" onClick={onClose} onKeyDownCapture={onKeyDown}></div>
      <div className="code-modal">
        <h3 className="code-modal-title">Reading the code!</h3>
        <SyntaxHighlighter language="javascript" style={dracula}>{code}</SyntaxHighlighter>
        <button className="code-modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}

export default CodeModal;
