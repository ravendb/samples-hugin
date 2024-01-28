import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";

import "../styles/pages/search-page.css";
import BackendTiming from "../components/BackendTiming";
import RelatedTags from "../components/RelatedTags";
import SearchController from "../components/SearchController";

function SearchPage() {
  const { queryResult } = useQuestions();
  console.log(queryResult);
  if (!queryResult) return <div>loading...</div>;
  return (
    <main className="search-page">
      <div className="question-container">
        <QuestionList queryResult={queryResult.data} />
        {/* <QuestionPagination totalPages={queryResult.data.totalPages} /> */}
      </div>
      <div className="search-page-info-container">
        <SearchController />
        <BackendTiming serverResult={queryResult} />
        <RelatedTags tags={queryResult.data.relatedTags} />
      </div>
    </main>
  );
}

export default SearchPage;
