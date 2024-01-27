/* eslint-disable react/prop-types */
import { formatDateToRelativeTime } from "../services/util.service";
import "../styles/components/comment-list.css";

function CommentList({ comments }) {
  if (!comments || comments.length === 0) return null;

  return (
    <ul className="comment-list">
      {comments.map((comment, i) => (
        <li key={comment.Id} className="comment">
          <div className="comment-number">{i + 1}</div>
          <p className="comment-text">
            {comment.Text}{" "}
            <span className="comment-owner">- {comment.User} </span>
            <span className="comment-creation-date">
              {formatDateToRelativeTime(comment.CreationDate)}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
