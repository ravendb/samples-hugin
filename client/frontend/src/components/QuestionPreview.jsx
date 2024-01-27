/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import "../styles/components/question-preview.css";

function QuestionPreview({ question }) {
  const navigate = useNavigate();

  function handlePreviewclick() {
    navigate(`/question/${question["@metadata"].id}`);
  }

  return (
    <article className="question-preview" onClick={handlePreviewclick}>
      <h3 className="question-preview-title">{question.Title}</h3>
      <div className="question-preview-content">
        <div className="question-preview-content-item">
          <h4>View Count:</h4>
          <p>{question.ViewCount}</p>
        </div>
        <div className="question-preview-content-item">
          <h4>Owner:</h4>
          <p>{question.Owner}</p>
        </div>
        <div className="question-preview-content-item">
          <h4>Tags:</h4>
          <p>{question.Tags.join(", ")}</p>
        </div>
      </div>
    </article>
  );
}

export default QuestionPreview;
