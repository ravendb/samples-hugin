/* eslint-disable react/prop-types */
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/components/tag-list.css";

function TagList({ tags }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleTagClick(tag) {
    navigate(`/search?tag=${tag}`);
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <div key={tag} className="tag" onClick={() => handleTagClick(tag)}>
          <span>{tag}</span>
        </div>
      ))}
    </div>
  );
}

export default TagList;
