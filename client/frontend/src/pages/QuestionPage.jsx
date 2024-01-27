import { useParams } from "react-router-dom";
import { getQuestion } from "../services/data.service";

function QuestionPage() {
  const { id } = useParams();
  const question = getQuestion();

  return (
    <div>
      <h1>Question Page</h1>
    </div>
  );
}

export default QuestionPage;
