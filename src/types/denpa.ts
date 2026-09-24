export type DenpaData = {
  id: string
  name: string
  evasion: string
  body: string
  colorCategory: string
  color: string
  head: string
  antennaCategory: string
  antenna: string
  feature: string
  capture: boolean
  favorite: boolean
  createdAt: number
  qrFile: File | null
}

export type SavedDenpaData = Omit<DenpaData, 'qrFile'> & {
  qrFile: string | null
}