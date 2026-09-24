import type {
  DenpaData,
  SavedDenpaData,
} from '../types/denpa'

import { dataUrlToFile } from './backup'
import {
  getQrFile,
  saveQrFile,
} from './qrStorage'

export const saveDenpaList = async (
  denpaList: DenpaData[]
): Promise<void> => {
  const savedData = denpaList.map((denpa) => ({
    ...denpa,
    qrFile: null,
  }))

  for (const denpa of denpaList) {
    if (denpa.qrFile) {
      await saveQrFile(denpa.id, denpa.qrFile)
    }
  }

  localStorage.setItem(
    'denpaList',
    JSON.stringify(savedData)
  )
}

export const loadDenpaList = async (): Promise<DenpaData[]> => {
  const savedData =
    localStorage.getItem('denpaList')

  if (!savedData) {
    return []
  }

  try {
    const parsedData =
      JSON.parse(savedData) as SavedDenpaData[]

    const restoredData: DenpaData[] =
      await Promise.all(
        parsedData.map(async (item) => {
          let qrFile: File | null = null

          if (item.qrFile) {
            qrFile = dataUrlToFile(
              item.qrFile,
              `${item.name || 'denpa'}.png`
            )
          } else {
            qrFile = await getQrFile(item.id)
          }

          return {
            ...item,
            qrFile,
          }
        })
      )

    return restoredData
  } catch (error) {
    console.error(
      'データの読み込みに失敗しました:',
      error
    )

    return []
  }
}