import type { SearchCondition } from '../types/search'

const SEARCH_CONDITIONS_KEY = 'searchConditions'

export const loadSearchConditions = (): SearchCondition[] => {
  const saved =
    localStorage.getItem(SEARCH_CONDITIONS_KEY)

  if (!saved) {
    return []
  }

  try {
    return JSON.parse(saved) as SearchCondition[]
  } catch (error) {
    console.error(
      '検索条件の読み込みに失敗しました:',
      error
    )

    return []
  }
}

export const saveSearchConditions = (
  searchConditions: SearchCondition[]
): void => {
  localStorage.setItem(
    SEARCH_CONDITIONS_KEY,
    JSON.stringify(searchConditions)
  )
}