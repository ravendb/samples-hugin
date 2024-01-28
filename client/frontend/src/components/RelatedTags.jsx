/* eslint-disable react/prop-types */
import "../styles/components/related-tags.css";
import { useAddToQueryParams } from "../hooks/useAddToQueryParams";

function RelatedTags({ tags }) {
  const { addToQueryParams } = useAddToQueryParams();

  function handleTagClick(tag) {
    addToQueryParams({
      key: "tag",
      value: tag,
    });
  }

  function handleCommunityClick(community) {
    addToQueryParams({
      key: "community",
      value: community,
    });
  }

  return (
    <div className="card related-tags">
      <h3 className="related-tags-title">Related tags:</h3>
      <ul className="related-tags-list">
        {tags.map((t) => (
          <li className="related-tag" key={t.Tag}>
            <p
              className="related-tag-title"
              onClick={() => handleTagClick(t.Tag)}
            >
              <strong>{t.Tag}</strong> <span>{t.Count.toLocaleString()}</span>
            </p>
            <ul className="related-tag-communities">
              {Object.entries(t.Communities).map(([key, value]) => (
                <li
                  key={key}
                  className="related-tag-community"
                  onClick={() => handleCommunityClick(key)}
                >
                  <img src={`/img/${key}.svg`} width="25px" />
                  <span>{value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RelatedTags;
