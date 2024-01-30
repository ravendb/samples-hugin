import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";

import "../styles/pages/search-page.css";
import BackendTiming from "../components/BackendTiming";
import RelatedTags from "../components/RelatedTags";
import SearchController from "../components/SearchController";
import DatabaseLink from "../components/DatabaseLink";
import QuestionPagination from "../components/QuestionPagination";
import "../styles/pages/search-page.css";

function SearchPage() {
  const { queryResult } = useQuestions();
  console.log(queryResult);
  if (!queryResult) return <div>loading...</div>;
  return (
    <main className="search-page">
      {!queryResult && <div className="search-page-loader">loading...</div>}
      {queryResult && (
        <>
          <div className="question-container">
            <QuestionList queryResult={queryResult.data} />
            <QuestionPagination totalResults={queryResult.data.totalResults} />
          </div>
          <div className="search-page-info-container">
            <SearchController />
            <BackendTiming timings={queryResult.timings} code={queryResult.code} />
            <DatabaseLink />
            <RelatedTags tags={queryResult.data.relatedTags} />
          </div>
        </>
      )}
    </main>
  );
}

export default SearchPage;
