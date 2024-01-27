/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import "../styles/components/question-preview.css";
import { formatDateToRelativeTime } from "../services/util.service";
import TagList from "./TagList";

function QuestionPreview({ question }) {
  const navigate = useNavigate();
  const text = question.Body.replace(/<[^>]+>/g, "").slice(0, 200) + "...";

  function handlePreviewclick() {
    const rawId = question["@metadata"]["@id"];
    const id = rawId.replace("questions/", "");
    navigate(`/question/${id}`);
  }

  return (
    <article className="question-preview" onClick={handlePreviewclick}>
      <div className="question-preview-stats">
        <div className="question-preview-stats-item">
          <span>{question.FavoriteCount}</span>
          <span>votes</span>
        </div>
        <div className="question-preview-stats-item">
          <span>{question.Answers.length}</span>
          <span>answers</span>
        </div>
        <div className="question-preview-stats-item">
          <span>{question.ViewCount}</span>
          <span>views</span>
        </div>
      </div>

      <div className="question-preview-content">
        <div>
          <h3 className="question-preview-title">{question.Title}</h3>
          <p className="question-preview-text">{text}</p>
        </div>
        <img
          className="question-preview-img"
          src={`/img/${question.Community}.svg`}
          alt="logo"
        />
      </div>

      <footer className="question-preview-footer">
        <TagList tags={question.Tags} />
        {/* <div className="question-preview-tags">
          {question.Tags.map((tag) => (
            <div key={tag} className="question-preview-tag">
              <span>{tag}</span>
            </div>
          ))}
        </div> */}

        <div className="question-preview-details">
          <span className="question-preview-owner">{question.Owner}</span>
          {question.FavoriteCount > 0 && (
            <span
              title="Favorite count"
              className="question-preview-favorite-count"
            >
              {question.FavoriteCount}
            </span>
          )}

          <span className="question-preview-creation-date">
            asked {formatDateToRelativeTime(question.CreationDate)}
          </span>
        </div>
      </footer>
    </article>
  );
}

export default QuestionPreview;
