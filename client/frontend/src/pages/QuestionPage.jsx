import { useSearchParams } from "react-router-dom";
import { getQuestion } from "../services/data.service";
import "../styles/pages/question-page.css";
import { formatDateToRelativeTime } from "../services/util.service";
import TagList from "../components/TagList";
import CommentList from "../components/CommentList";
import { useQuestions } from "../hooks/useQuestions";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setQuestion } from "../store/questionSlice";
import BackendTiming from "../components/BackendTiming";
import DatabaseLink from "../components/DatabaseLink";


function QuestionPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const questionResult = useQuestions().question;

  useEffect(() => {
    async function fetchQuestion(id) {
      const q = await getQuestion(id);
      dispatch(setQuestion(q));
    }

    fetchQuestion(searchParams.get("id"));
  }, [dispatch]);

  if (!questionResult) return <div className="loader">Loading...</div>;
  const question = questionResult.data.question;
  return (
    <main className="question-page">
      <div className="question-page-content">
        <header className="question-page-header">
          <h1 className="question-page-title">{question.Title}</h1>

          <div className="question-page-header-details">
            <div className="question-page-header-details-item">
              <span className="question-page-header-details-item-key">
                asked
              </span>
              <span className="question-page-header-details-item-value">
                {formatDateToRelativeTime(question.CreationDate)}
              </span>
            </div>
            {question.LastEditDate && (
              <div className="question-page-header-details-item">
                <span className="question-page-header-details-item-key">
                  modified
                </span>
                <span className="question-page-header-details-item-value">
                  {formatDateToRelativeTime(question.CreationDate)}
                </span>
              </div>
            )}

            <div className="question-page-header-details-item">
              <span className="question-page-header-details-item-key">
                viewed
              </span>
              <span className="question-page-header-details-item-value">
                {question.ViewCount} times
              </span>
            </div>
          </div>
        </header>

        <div
          className="question-page-question-body"
          dangerouslySetInnerHTML={{ __html: question.Body }}
        ></div>
        <TagList tags={question.Tags} />

        <div className="question-page-user-info">
          <div className="question-page-user-info-details">
            <span className="question-page-user-info-name">
              {question.Owner}
            </span>
          </div>
        </div>

        <CommentList comments={question.Comments} />

        <div className="question-page-answers-list">
          <h3 className="question-page-answers-list-title">
            {question.Answers.length}{" "}
            {question.Answers.length === 1 ? "Answer" : "Answers"}
          </h3>

          {question.Answers.map((answer) => {
            return (
              <div key={answer.Id} className="question-page-answer">
                <div
                  className="question-page-answer-body"
                  dangerouslySetInnerHTML={{ __html: answer.Body }}
                ></div>

                <div className="question-page-answer-details">
                  <div className="question-page-answer-details-body">
                    <p className="question-page-answer-user-info-creation-date">
                      answered at{" "}
                      {formatDateToRelativeTime(answer.CreationDate)}
                    </p>
                    <p className="question-page-answer-user-info-name">
                      {answer.Owner}
                    </p>
                  </div>
                </div>

                <CommentList comments={answer.Comments} />
              </div>
            );
          })}
        </div>
      </div>
      <div >
        <BackendTiming timings={questionResult.timings} code={questionResult.code} />
        <DatabaseLink />
      </div>
    </main>
  );
}

export default QuestionPage;
