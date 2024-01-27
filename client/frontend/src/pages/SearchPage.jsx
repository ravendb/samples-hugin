import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";
import "../styles/pages/search-page.css";

function SearchPage() {
  const { questions } = useQuestions();
  const isQuestionListEmpty = questions.length === 0;

  return (
    <main className="search-page">
      <div className="question-container">
        {isQuestionListEmpty ? (
          <div className="loader">Loading...</div>
        ) : (
          <QuestionList questions={questions} />
        )}
      </div>

      <div className="card search-page-info-card">
        <div>questions length:</div>
        <div>{questions.length}</div>
      </div>
    </main>
  );
}

export default SearchPage;
