import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";

import "../styles/pages/search-page.css";
import BackendTiming from "../components/BackendTiming";
import RelatedTags from "../components/RelatedTags";
import SearchController from "../components/SearchController";
import DatabaseLink from "../components/DatabaseLink";

function SearchPage() {
  const { queryResult } = useQuestions();
  console.log(queryResult);
  if (!queryResult) return <div>loading...</div>;
  return (
    <main className="search-page container">
      <div className="row">
        <div className="col-lg-8">
          <SearchController />
          <div className="question-container">
            <QuestionList queryResult={queryResult.data} />
            {/* <QuestionPagination totalResults={queryResult.data.totalResults} /> */}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="search-page-info-container">
            
            <BackendTiming serverResult={queryResult} />
            <DatabaseLink />
            <RelatedTags tags={queryResult.data.relatedTags} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default SearchPage;
