import { useSearchParams } from "react-router-dom";
import { getQuestion } from "../services/data.service";
import "../styles/pages/question-page.css";
import { formatDateToRelativeTime, getUserLink, getUserName } from "../services/util.service";
import TagList from "../components/TagList";
import CommentList from "../components/CommentList";
import { getServerResult, setQuestionResult } from "../store/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import BackendTiming from "../components/BackendTiming";
import DatabaseLink from "../components/DatabaseLink";
import { ExternalLink } from "../components/ExternalLink";


function QuestionPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { questionResult } = getServerResult();

  useEffect(() => {
    async function fetchQuestion(id) {
      const q = await getQuestion(id);
      dispatch(setQuestionResult(q));
    }

    fetchQuestion(searchParams.get("id"));
  }, [dispatch]);


  if (!questionResult.data || questionResult.data.question.id !== searchParams.get("id")) {
    return <div className="loader">Loading...</div>;
  }

  const users = questionResult.data.users;
  const question = questionResult.data.question;
  return (
    <main className="question-page container my-4">
      <div className="row">
        <div className="question-page-content col-lg-8 mb-4">
          <header className="question-page-header">
            <h2 className="question-page-title">{question.Title}</h2>

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

          <div className="card mb-3">
            <div
              className="question-page-question-body card-body"
              dangerouslySetInnerHTML={{ __html: question.Body }}
            ></div>
          </div>
          <TagList tags={question.Tags} />

          <div className="question-page-user-info">
            <div className="question-page-user-info-details">
              <span className="question-page-user-info-name">
                <ExternalLink href={getUserLink(question.Owner)} className="user-link">{getUserName(question.Owner, users)}</ExternalLink>
              </span>
            </div>
          </div>

          <CommentList comments={question.Comments} users={users} />

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
                        <ExternalLink href={getUserLink(answer.Owner)} className="user-link">{getUserName(answer.Owner, users)}</ExternalLink>
                      </p>
                    </div>
                  </div>

                  <CommentList comments={answer.Comments} users={users} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-lg-4 vstack gap-3 mb-4">
          <BackendTiming timings={questionResult.timings} code={questionResult.code} />
          <DatabaseLink />
        </div>
      </div>
    </main>
  );
}

export default QuestionPage;
