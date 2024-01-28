/* eslint-disable react/prop-types */
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/components/related-tags.css";

function RelatedTags({ tags }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  function handleTagClick(tag) {
    let url = `/search?`;
    const q = searchParams.get("q");
    if (q) url += "&q=" + q;
    const community = searchParams.get("community");
    if (community) url += "&community=" + community;

    if (tag) url += "&tag=" + tag;

    navigate(url);
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
              {" "}
              <strong>{t.Tag}</strong> {t.Count.toLocaleString()}
            </p>
            <ul>
              {Object.entries(t.Communities).map(([key, value]) => (
                <li key={key}>
                  <img src={`/img/${key}.svg`} width="25px" />{" "}
                  {value.toLocaleString()}
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
