/* eslint-disable react/prop-types */
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "../styles/components/code-modal.css";

function CodeModal({ code, onClose }) {
  return (
    <>
      <div className="code-modal-main-screen" onClick={onClose}></div>
      <div className="code-modal">
        <h3 className="code-modal-title">Reading the code!</h3>
        <SyntaxHighlighter language="javascript">{code}</SyntaxHighlighter>
        {/* <pre className="code-modal-code">
          <code>{code}</code>
        </pre> */}
        <button className="code-modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}

export default CodeModal;
