import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '..'
import type { Lang } from '../../types/app'

interface LanguageState {
  lang: Lang
}

const initialState: LanguageState = {
  lang: 'en',
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLang(state, action: PayloadAction<Lang>) {
      state.lang = action.payload
    },
  },
})

export const { setLang } = languageSlice.actions
export const languageReducer = languageSlice.reducer
export const selectLang = (state: RootState) => state.language.lang
