/* eslint-disable react/prop-types */
import { formatDateToRelativeTime, getUserName, getUserLink } from "../services/util.service";
import "../styles/components/comment-list.css";

function CommentList({ comments, users }) {
  if (!comments || comments.length === 0) return null;
  const localUsers = users;
  return (
    <ul className="comment-list">
      {comments.map((comment, i) => (
        <li key={comment.Id} className="comment">
          <div className="comment-number">{i + 1}</div>
          <p className="comment-text">
            {comment.Text}{" "}
            <span className="comment-owner">- <a href={getUserLink(comment.User)} className="user-link">{getUserName(comment.User, localUsers)}</a> </span>
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
