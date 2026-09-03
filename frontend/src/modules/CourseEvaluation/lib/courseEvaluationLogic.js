export function areLikertQuestionsComplete(questions, responses = {}) {
  return questions.every(({ id }) => Number(responses[id]) >= 1 && Number(responses[id]) <= 5)
}

export function areKnowledgeQuestionsComplete(questions, answers = {}) {
  return questions.every(({ id }) => typeof answers[id] === 'string' && answers[id].length === 1)
}
