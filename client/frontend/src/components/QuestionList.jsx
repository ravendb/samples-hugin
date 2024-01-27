/* eslint-disable react/prop-types */
import "../styles/components/question-list.css";
import QuestionPreview from "./QuestionPreview";

function QuestionList({ queryResult }) {
  return (
    <ul className="question-list">
      {queryResult.results.map((question, i) => (
        <li key={i}>
          <QuestionPreview question={question} />
        </li>
      ))}
    </ul>
  );
}

export default QuestionList;
