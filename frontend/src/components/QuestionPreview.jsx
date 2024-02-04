/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import "../styles/components/question-preview.css";
import { formatDateToRelativeTime, getUserLink, getUserName } from "../services/util.service";
import TagList from "./TagList";

function QuestionPreview({ question, users }) {
  const navigate = useNavigate();
  const text = question.Body.replace(/<[^>]+>/g, "").slice(0, 200) + "...";

  function handlePreviewclick() {
    navigate(`/question?id=${question.id}`);
  }

  return (
    <div className="card">
      <article className="card-body question-preview" onClick={handlePreviewclick}>
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
        <h3 className="question-preview-title m-0">{question.Title}</h3>
        <p className="question-preview-text">{text}</p>
        <div className="question-preview-img">
          <img
            src={`/img/${question.Community}.svg`}
            alt="logo"
          />
        </div>


        <footer className="question-preview-footer">
          <TagList tags={question.Tags} />
          <div className="question-preview-details">
            <span className="question-preview-owner"><ExternalLink href={getUserLink(question.Owner)}> {getUserName(question.Owner, users)}</ExternalLink></span>
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
    </div>
  );
}

export default QuestionPreview;
