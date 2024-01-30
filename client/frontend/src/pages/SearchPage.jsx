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
    <main className="search-page container my-3">
      {!queryResult && <div className="search-page-loader">loading...</div>}
      {queryResult && (
        <div className="row">
          <div className="question-container col-lg-8">
            <SearchController />
            <QuestionPagination totalResults={queryResult.data.totalResults} className="pt-4 pb-1" />
            <QuestionList queryResult={queryResult.data} />
            <QuestionPagination totalResults={queryResult.data.totalResults} className={"pt-3 pb-7"} />
          </div>
          <div className="search-page-info-container col-lg-4">
            
            <BackendTiming timings={queryResult.timings} code={queryResult.code} />
            <DatabaseLink />
            <RelatedTags tags={queryResult.data.relatedTags} />
          </div>
        </div>
      )}
    </main>
  );
}

export default SearchPage;
