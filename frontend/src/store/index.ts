import { configureStore } from '@reduxjs/toolkit'
import { appReducer } from './app'
import { evaluationReducer } from './courseEvaluation'
import { languageReducer } from './language'
import { preCourseEvaluationReducer } from './preCourseEvaluation'
import { progressReducer } from './progress'
import { userProgressReducer } from './userProgress'

const preloadedProgress = (() => {
  try {
    const raw = localStorage.getItem('brain_ai_101_progress')
    return raw ? { userProgress: JSON.parse(raw) } : {}
  } catch {
    return {}
  }
})()

export const store = configureStore({
  reducer: {
    app: appReducer,
    language: languageReducer,
    progress: progressReducer,
    evaluation: evaluationReducer,
    preCourseEvaluation: preCourseEvaluationReducer,
    userProgress: userProgressReducer,
  },
  preloadedState: preloadedProgress,
})

store.subscribe(() => {
  try {
    const state = store.getState()
    localStorage.setItem('brain_ai_101_progress', JSON.stringify(state.userProgress))
  } catch {
    // quota exceeded or unavailable
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
