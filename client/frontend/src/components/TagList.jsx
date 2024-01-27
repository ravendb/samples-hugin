/* eslint-disable react/prop-types */
import "../styles/components/tag-list.css";

function TagList({ tags }) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <div key={tag} className="tag">
          <span>{tag}</span>
        </div>
      ))}
    </div>
  );
}

export default TagList;
