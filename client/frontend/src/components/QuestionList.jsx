/* eslint-disable react/prop-types */
import "../styles/components/question-list.css";
import QuestionPreview from "./QuestionPreview";

function QuestionList({ queryResult }) {
  const isEmpty = queryResult.results.length === 0;

  return (
    <ul className="question-list">
      {isEmpty ? (
        <div className="card no-res">No results found</div>
      ) : (
        <>
          {queryResult.results.map((question, i) => (
            <li key={i}>
              <QuestionPreview question={question} users={queryResult.users} />
            </li>
          ))}
        </>
      )}
    </ul>
  );
}

export default QuestionList;
