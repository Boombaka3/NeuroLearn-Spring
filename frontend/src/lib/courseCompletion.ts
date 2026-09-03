import type { RootState } from '../store'
import { strings } from '../i18n/strings'
import type { Lang } from '../types/app'

const REQUIRED_MODULES = [
  {
    id: 'module1',
    labelKey: 'completion.requirement.module1.label',
    detailKey: 'completion.requirement.module1.detail',
    totalSections: 4,
  },
  {
    id: 'module2',
    labelKey: 'completion.requirement.module2.label',
    detailKey: 'completion.requirement.module2.detail',
    totalSections: 5,
  },
  {
    id: 'module3',
    labelKey: 'completion.requirement.module3.label',
    detailKey: 'completion.requirement.module3.detail',
    totalSections: 6,
  },
] as const

export interface CourseCompletionItem {
  id: string
  label: string
  detail: string
  completed: boolean
}

export interface CourseCompletionStatus {
  completedCount: number
  totalCount: number
  isUnlocked: boolean
  items: CourseCompletionItem[]
  missingItems: CourseCompletionItem[]
}

function getString(lang: Lang, key: string) {
  return strings[lang][key] ?? strings.en[key] ?? key
}

function normalizeVisitedSections(visitedSections: number[] | undefined) {
  if (!Array.isArray(visitedSections)) {
    return []
  }

  return Array.from(new Set(visitedSections)).sort((left, right) => left - right)
}

export function getCourseCompletionStatus(state: RootState): CourseCompletionStatus {
  const lang = state.language?.lang ?? 'en'
  const items: CourseCompletionItem[] = REQUIRED_MODULES.map((moduleConfig) => {
      const moduleProgress = state.userProgress.modules[moduleConfig.id]
      const visitedSections = normalizeVisitedSections(moduleProgress?.visitedSections)

      return {
        id: moduleConfig.id,
        label: getString(lang, moduleConfig.labelKey),
        detail: getString(lang, moduleConfig.detailKey),
        completed:
          Boolean(moduleProgress?.completedAt) ||
          visitedSections.length >= moduleConfig.totalSections,
      }
    })

  const missingItems = items.filter((item) => !item.completed)
  const completedCount = items.length - missingItems.length

  return {
    completedCount,
    totalCount: items.length,
    isUnlocked: missingItems.length === 0,
    items,
    missingItems,
  }
}

export const selectCourseCompletionStatus = (state: RootState) => getCourseCompletionStatus(state)
