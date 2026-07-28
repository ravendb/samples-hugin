import QuestionList from "../components/QuestionList";
import { getServerResult } from "../store/store";
import "../styles/pages/search-page.css";
import RelatedTags from "../components/RelatedTags";
import SearchController from "../components/SearchController";
import DatabaseLink from "../components/DatabaseLink";
import QuestionPagination from "../components/QuestionPagination";
import BackendTiming from "../components/BackendTiming";
import SearchSkeleton from "../components/SearchSkeleton";

export default function SearchPage() {
  const { searchResult } = getServerResult();
  const isAi = searchResult.viewMode === "ai";
  const active = isAi ? searchResult.ai : searchResult.normal;
  const waiting = searchResult.refining && !active;

  return (
    <main className="search-page container my-3">
      <div className="row">
        <div className="question-container col-lg-8 mb-4">
          <SearchController />
          {searchResult.error && (
            <div className="alert alert-danger" role="alert">{searchResult.error}</div>
          )}
          {waiting ? (
            <SearchSkeleton mode={isAi ? "ai" : "fts"} />
          ) : active?.data ? (
            <>
              <QuestionPagination totalResults={active.data.totalResults} className="pt-1 pb-1" />
              <QuestionList queryResult={active.data} />
              <QuestionPagination totalResults={active.data.totalResults} className="pt-3 pb-7" />
            </>
          ) : null}
        </div>
        <div className="search-page-info-container col-lg-4 mb-4">
          <BackendTiming result={active} mode={isAi ? "ai" : "fts"} refining={waiting} />
          <DatabaseLink />
          {active?.data && <RelatedTags tags={active.data.relatedTags || []} />}
        </div>
      </div>
    </main>
  );
}
