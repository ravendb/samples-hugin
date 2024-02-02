import QuestionList from "../components/QuestionList";
import { getServerResult } from "../store/store";

import "../styles/pages/search-page.css";
import BackendTiming from "../components/BackendTiming";
import RelatedTags from "../components/RelatedTags";
import SearchController from "../components/SearchController";
import DatabaseLink from "../components/DatabaseLink";
import QuestionPagination from "../components/QuestionPagination";
import "../styles/pages/search-page.css";

function SearchPage() {
  const { searchResult } = getServerResult();

  return (
    <main className="search-page container my-3">
      {!searchResult.data && <div className="search-page-loader">Loading...</div>}
      {searchResult.data && (
        <div className="row">
          <div className="question-container col-lg-8 mb-4">
            <SearchController />
            <QuestionPagination totalResults={searchResult.data.totalResults} className="pt-4 pb-1" />
            <QuestionList queryResult={searchResult.data} />
            <QuestionPagination totalResults={searchResult.data.totalResults} className={"pt-3 pb-7"} />
          </div>
          <div className="search-page-info-container col-lg-4 mb-4">

            <BackendTiming timings={searchResult.timings} code={searchResult.code} />
            <DatabaseLink />
            <RelatedTags tags={searchResult.data.relatedTags} />
          </div>
        </div>
      )}
    </main>
  );
}

export default SearchPage;
