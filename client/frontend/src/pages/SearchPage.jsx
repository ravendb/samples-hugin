import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

import "../styles/pages/search-page.css";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const { queryResult } = useQuestions();
  const navigate = useNavigate();

  if (!queryResult) return <div>loading...</div>

  function handleTagClick(tag) {
    let url = `/search?`;
    const q = searchParams.get("q");
    if (q)
      url += '&q=' + q;
    const community = searchParams.get("community");
    if (community)
      url += '&community=' + community;

    if (tag)
      url += '&tag=' + tag;

    navigate(url);
  }

  return (
    <main className="search-page">
      <div className="question-container">
        <QuestionList queryResult={queryResult.data} />
      </div>
      <div className="card search-page-info-card">
        <h4>Backend timings:</h4>
        <ul>
          {Object.entries(queryResult.timings || {}).map(([key, value]) => (
            <li><strong>{key}</strong> - {(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ms</li>
          ))}
        </ul>
        <h3>Reading the code!</h3>
        <img src={`/img/code.svg`} width="50px" /> Click here to see how the backend works.
        <pre>
          <code class="language-js">
            {queryResult.code}
          </code>
        </pre>
      </div>
      <div className="card search-page-info-card">

        <h3>Related tags:</h3>
        <ul>
          {queryResult.data.relatedTags.map((t) => (
            <li>
              <div onClick={() => handleTagClick(t.Tag)}> <strong>{t.Tag}</strong> {t.Count.toLocaleString()}</div>
              <ul>
                {Object.entries(t.Communities).map(([key, value]) => (
                  <li><img src={`/img/${key}.svg`} width="25px" /> {value.toLocaleString()}</li>
                ))}
              </ul>
            </li>

          )
          )}
        </ul>
      </div>
    </main>
  );
}

export default SearchPage;
