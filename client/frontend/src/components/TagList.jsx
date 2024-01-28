/* eslint-disable react/prop-types */
import "../styles/components/tag-list.css";
import { useAddToQueryParams } from "../hooks/useAddToQueryParams";

function TagList({ tags }) {
  const { addToQueryParams } = useAddToQueryParams();

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <div
          key={tag}
          className="tag"
          onClick={(e) => {
            e.stopPropagation();
            addToQueryParams({
              key: "tag",
              value: tag,
            });
          }}
        >
          <span>{tag}</span>
        </div>
      ))}
    </div>
  );
}

export default TagList;
