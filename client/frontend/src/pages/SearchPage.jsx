import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";
import "../styles/pages/search-page.css";

function SearchPage() {
  const { queryResult } = useQuestions();
  if (!queryResult) return <div>loading...</div>
  return (
    <main className="search-page">
      <div className="question-container">
        <QuestionList queryResult={queryResult} />
      </div>

      <div className="card search-page-info-card">
        <div>sidebar:</div>
      </div>
    </main>
  );
}

export default SearchPage;
