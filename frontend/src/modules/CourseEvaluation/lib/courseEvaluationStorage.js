const STORAGE_KEY = 'brainAi101.courseEvaluation.v1'
const PRE_COURSE_STORAGE_KEY = 'brainAi101.preCourseEvaluation.v1'
const SESSION_ID_KEY = 'brain_ai_101_session_id'
const PARTICIPANT_CODE_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function generateAttemptId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `attempt-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

function normalizeAttempt(raw = {}) {
  return {
    attemptId: raw.attemptId || generateAttemptId(),
    startedAt: raw.startedAt || new Date().toISOString(),
    completedAt: raw.completedAt || null,
    likertResponses: raw.likertResponses || {},
    openResponses: raw.openResponses || {},
    quizAnswers: raw.quizAnswers || {},
    score: Number.isFinite(raw.score) ? raw.score : null,
    maxScore: Number.isFinite(raw.maxScore) ? raw.maxScore : null,
    moduleBreakdown: raw.moduleBreakdown || {},
    passed: typeof raw.passed === 'boolean' ? raw.passed : false,
    remoteSubmissionStatus: typeof raw.remoteSubmissionStatus === 'string' ? raw.remoteSubmissionStatus : 'idle',
    remoteSubmissionError: typeof raw.remoteSubmissionError === 'string' ? raw.remoteSubmissionError : '',
    remoteSubmissionFiles: Array.isArray(raw.remoteSubmissionFiles) ? raw.remoteSubmissionFiles : [],
  }
}

function normalizePreCourseAttempt(raw = {}) {
  return {
    attemptId: raw.attemptId || generateAttemptId(),
    startedAt: raw.startedAt || new Date().toISOString(),
    completedAt: raw.completedAt || null,
    skipped: typeof raw.skipped === 'boolean' ? raw.skipped : false,
    likertResponses: raw.likertResponses || {},
    openResponse: typeof raw.openResponse === 'string' ? raw.openResponse : '',
    source: 'pre-course',
    version: 1,
  }
}

export function getOrCreateSessionId() {
  const existing = localStorage.getItem(SESSION_ID_KEY)
  if (existing && existing.length >= 6 && existing.length <= 32 && PARTICIPANT_CODE_PATTERN.test(existing)) {
    return existing.toUpperCase()
  }
  const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replaceAll('-', '').slice(0, 20)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.slice(0, 20)
  const id = `BRAIN-${randomPart}`.toUpperCase()
  localStorage.setItem(SESSION_ID_KEY, id)
  return id
}

export function createEvaluationAttempt(seed = {}) {
  return normalizeAttempt({
    ...seed,
    attemptId: generateAttemptId(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    score: null,
    maxScore: null,
    moduleBreakdown: {},
    passed: false,
    remoteSubmissionStatus: 'idle',
    remoteSubmissionError: '',
    remoteSubmissionFiles: [],
  })
}

export function saveEvaluationAttempt(attempt) {
  const normalized = normalizeAttempt(attempt)
  if (!canUseStorage()) return normalized

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function loadEvaluationAttempt() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeAttempt(JSON.parse(raw))
  } catch (error) {
    console.error('Failed to load course evaluation attempt', error)
    return null
  }
}

export function clearEvaluationAttempt() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function submitEvaluationAttempt(attempt) {
  const normalized = normalizeAttempt({
    ...attempt,
    completedAt: new Date().toISOString(),
  })

  return saveEvaluationAttempt(normalized)
}

export function saveSubmissionToLocalStorage(kind, payload) {
  try {
    const STORAGE_KEY = `brain_ai_101_${kind}_backup`
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    existing.push({ ...payload, savedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function exportLocalBackups() {
  const keys = ['brain_ai_101_quiz_backup', 'brain_ai_101_evaluation_backup', 'brain_ai_101_pre_evaluation_backup']
  const result = {}
  keys.forEach((key) => {
    try {
      result[key] = JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      result[key] = []
    }
  })
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `brain_ai_101_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function createPreCourseEvaluationAttempt(seed = {}) {
  return normalizePreCourseAttempt({
    ...seed,
    attemptId: generateAttemptId(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    skipped: false,
    source: 'pre-course',
    version: 1,
  })
}

export function savePreCourseEvaluationAttempt(attempt) {
  const normalized = normalizePreCourseAttempt(attempt)
  if (!canUseStorage()) return normalized

  window.localStorage.setItem(PRE_COURSE_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function loadPreCourseEvaluationAttempt() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(PRE_COURSE_STORAGE_KEY)
    if (!raw) return null
    return normalizePreCourseAttempt(JSON.parse(raw))
  } catch (error) {
    console.error('Failed to load pre-course evaluation attempt', error)
    return null
  }
}

export function clearPreCourseEvaluationAttempt() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(PRE_COURSE_STORAGE_KEY)
}

export function markPreCourseEvaluationSkipped() {
  const currentAttempt = loadPreCourseEvaluationAttempt()
  const normalized = normalizePreCourseAttempt({
    ...(currentAttempt || createPreCourseEvaluationAttempt()),
    skipped: true,
    completedAt: new Date().toISOString(),
  })

  return savePreCourseEvaluationAttempt(normalized)
}
