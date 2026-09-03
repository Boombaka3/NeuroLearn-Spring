import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ModuleProgress {
  moduleId: string
  lastSectionIndex: number
  visitedSections: number[]
  completedAt: string | null
}

interface UserProgressState {
  sessionId: string | null
  modules: Record<string, ModuleProgress>
  lastActiveModule: string | null
}

const initialState: UserProgressState = {
  sessionId: null,
  modules: {},
  lastActiveModule: null,
}

const userProgressSlice = createSlice({
  name: 'userProgress',
  initialState,
  reducers: {
    setSessionId(state, action: PayloadAction<string>) {
      state.sessionId = action.payload
    },
    updateSectionProgress(state, action: PayloadAction<{
      moduleId: string
      sectionIndex: number
      totalSections: number
    }>) {
      const { moduleId, sectionIndex, totalSections } = action.payload
      const existing = state.modules[moduleId] ?? {
        moduleId,
        lastSectionIndex: 0,
        visitedSections: [],
        completedAt: null,
      }
      existing.lastSectionIndex = Math.max(existing.lastSectionIndex, sectionIndex)
      if (!existing.visitedSections.includes(sectionIndex)) {
        existing.visitedSections.push(sectionIndex)
      }
      if (existing.visitedSections.length >= totalSections && !existing.completedAt) {
        existing.completedAt = new Date().toISOString()
      }
      state.modules[moduleId] = existing
      state.lastActiveModule = moduleId
    },
  },
})

export const { setSessionId, updateSectionProgress } = userProgressSlice.actions
export default userProgressSlice.reducer
