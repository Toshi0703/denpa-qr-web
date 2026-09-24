export type SearchCondition = {
  id: string
  name: string

  uuid: string
  searchName: string
  evasion: string
  body: string
  colorCategory: string
  color: string
  head: string
  antennaCategory: string
  antenna: string
  feature: string

  nameRequired: boolean
  evasionRequired: boolean
  bodyRequired: boolean
  colorRequired: boolean
  headRequired: boolean
  antennaRequired: boolean
  featureRequired: boolean

  optionalMin: number

  createdAt: number
}

export type SearchPageState = {
  uuid: string
  name: string
  evasion: string
  body: string
  colorCategory: string
  color: string
  head: string
  antennaCategory: string
  antenna: string
  feature: string
  captureSearch: string
  favoriteSearch: string
  sortMode: 'new' | 'old' | 'name'
  currentPage: number
  nameRequired: boolean
  evasionRequired: boolean
  bodyRequired: boolean
  colorRequired: boolean
  headRequired: boolean
  antennaRequired: boolean
  featureRequired: boolean
  optionalMin: number
  itemsPerPage: number
}

export type SearchMatch = {
  required: string[]
  optional: string[]
}