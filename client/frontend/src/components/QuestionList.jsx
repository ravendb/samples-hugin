import { useQuestions } from "../hooks/useQuestions";
import "../styles/components/question-list.css";
import QuestionPreview from "./QuestionPreview";

function QuestioList() {
  const { questions } = useQuestions();

  return (
    <ul className="question-list">
      {questions.map((question, i) => (
        <li key={i}>
          <QuestionPreview question={question} />
        </li>
      ))}
    </ul>
  );
}

export default QuestioList;
