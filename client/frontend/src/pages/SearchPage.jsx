import QuestionList from "../components/QuestionList";
import { useQuestions } from "../hooks/useQuestions";
import "../styles/pages/search-page.css";

function SearchPage() {
  const { questions } = useQuestions();
  const isQuestionListEmpty = questions.length === 0;

  return (
    <main className="search-page">
      {isQuestionListEmpty ? (
        <div className="loader">Loading...</div>
      ) : (
        <QuestionList questions={questions} />
      )}
    </main>
  );
}

export default SearchPage;
