export type AppView =
  | 'landing'
  | 'preCourseEvaluation'
  | 'module1'
  | 'module2'
  | 'module3'
  | 'courseEvaluation'
  | 'completion'

export type Lang = 'en' | 'zh'

export interface AppState {
  currentView: AppView
}
