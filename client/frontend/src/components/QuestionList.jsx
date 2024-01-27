/* eslint-disable react/prop-types */
import "../styles/components/question-list.css";
import QuestionPreview from "./QuestionPreview";

function QuestionList({ questions }) {
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

export default QuestionList;
