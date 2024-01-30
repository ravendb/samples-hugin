import { useSearchParams } from "react-router-dom";
import "../styles/components/question-pagination.css";

/* eslint-disable react/prop-types */
function QuestionPagination({ totalResults, className }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const numOfPages = Math.ceil(totalResults / pageSize);

  return (
    <div className={"search-page-pagination " + className}>

      <div className="search-page-pagination-info hstack justify-content-between gap-4">
        <button
          className="search-page-pagination-info-button btn btn-primary rounded-pill px-3"
          onClick={() => {
            setSearchParams(searchParams => {
              searchParams.set("page", page - 1);
              return searchParams;
            });
          }}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="search-page-pagination-info-text text-muted hstack gap-1">
          Showing
          <strong className="text-emphasis"> {(((page - 1) * pageSize) + 1).toLocaleString()} - {Math.min((page) * pageSize, totalResults).toLocaleString()} </strong>
          of
          <strong className="text-emphasis"> {totalResults.toLocaleString()} </strong>
          results
        </span>
        <button
          className="search-page-pagination-info-button btn btn-primary rounded-pill px-3"
          onClick={() => {
            setSearchParams(searchParams => {
              searchParams.set("page", page + 1);
              return searchParams;
            });
          }}
          disabled={page === numOfPages}
        >
          Next
        </button>
      </div>

    </div>
  );
}

export default QuestionPagination;