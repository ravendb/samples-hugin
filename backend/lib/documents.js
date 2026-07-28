"use strict";

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return [...new Set(values.flatMap((item) => {
    if (typeof item !== "string") return [];
    return item.includes("|")
      ? item.split("|").map((tag) => tag.trim()).filter(Boolean)
      : [item.trim()].filter(Boolean);
  }))];
}

function normalizeCommunity(document) {
  if (!document) return document;
  const community =
    document.Community || document.community || document.Name || document.name;
  return { ...document, Community: community, Name: document.Name || community };
}

function trimQuestion(question) {
  if (!question) return question;
  const body = String(question.Body || "").replace(/<[^>]+>/g, " ");
  return {
    ...question,
    Body: body.replace(/\s+/g, " ").trim().slice(0, 320),
    Tags: normalizeTags(question.Tags),
    AnswerCount:
      question.AnswerCount ??
      (Array.isArray(question.Answers) ? question.Answers.length : 0),
    CommentCount:
      question.CommentCount ??
      (Array.isArray(question.Comments) ? question.Comments.length : 0),
    Answers: undefined,
    Comments: undefined,
  };
}

module.exports = { normalizeTags, normalizeCommunity, trimQuestion };
