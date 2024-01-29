import { useSearchParams } from "react-router-dom";
import "../styles/components/question-pagination.css";

/* eslint-disable react/prop-types */
function QuestionPagination({ totalResults }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const numOfPages = Math.ceil(totalResults / pageSize);

  return (
    <div className="search-page-pagination">

      <div className="search-page-pagination-info">
        <button
          className="search-page-pagination-info-button"
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
        <span className="search-page-pagination-info-text">
          Showing {(page * pageSize).toLocaleString()} - {Math.min((page + 1) * pageSize, totalResults).toLocaleString()} of {totalResults.toLocaleString()} results
        </span>
        <button
          className="search-page-pagination-info-button"
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