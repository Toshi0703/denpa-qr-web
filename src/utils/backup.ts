import type { Dispatch, SetStateAction } from 'react'

type DenpaData = {
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

type SearchCondition = {
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

type QrHistory = {
  id: string
  qrData: string
  createdAt: number
}

type SavedDenpaData = Omit<DenpaData, 'qrFile'> & {
  qrFile: string | null
}

type BackupData = {
  version: 1
  createdAt: number
  denpaList: SavedDenpaData[]
  qrHistory: QrHistory[]
  searchConditions: SearchCondition[]
}

const fileToDataUrl = (
  file: File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result as string)
    }

    reader.onerror = () => {
      reject(reader.error)
    }

    reader.readAsDataURL(file)
  })
}

export const dataUrlToFile = (
  dataUrl: string,
  fileName: string
): File => {
  const [header, base64] = dataUrl.split(',')

  const mimeMatch = header.match(/:(.*?);/)

  const mimeType =
    mimeMatch?.[1] ??
    'image/png'

  const binary = atob(base64)

  const bytes =
    new Uint8Array(binary.length)

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i)
  }

  return new File(
    [bytes],
    fileName,
    {
      type: mimeType,
    }
  )
}

export const createBackupFile = async (
  denpaList: DenpaData[],
  qrHistory: QrHistory[],
  searchConditions: SearchCondition[]
) => {
  const savedData: SavedDenpaData[] =
    await Promise.all(
      denpaList.map(async (item) => ({
        ...item,
        qrFile: item.qrFile
          ? await fileToDataUrl(item.qrFile)
          : null,
      }))
    )

  const backupData: BackupData = {
    version: 1,
    createdAt: Date.now(),
    denpaList: savedData,
    qrHistory,
    searchConditions,
  }

  const blob = new Blob(
    [JSON.stringify(backupData, null, 2)],
    { type: 'application/json' }
  )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url

  link.download =
    `denpa-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`

  link.click()

  URL.revokeObjectURL(url)
}

export const restoreBackupFile = (
  file: File,
  setDenpaList: Dispatch<
    SetStateAction<DenpaData[]>
  >,
  setQrHistory: Dispatch<
    SetStateAction<QrHistory[]>
  >,
  setSearchConditions: Dispatch<
    SetStateAction<SearchCondition[]>
  >
) => {
  const reader = new FileReader()

  reader.onload = () => {
    try {
      const backupData =
        JSON.parse(
          reader.result as string
        ) as BackupData

      if (backupData.version !== 1) {
        alert(
          '対応していないバックアップファイルです。'
        )
        return
      }

      const restoredData: DenpaData[] =
        backupData.denpaList.map(
          (item) => ({
            ...item,
            qrFile: item.qrFile
              ? dataUrlToFile(
                  item.qrFile,
                  `${item.name || 'denpa'}.png`
                )
              : null,
            createdAt:
              item.createdAt ?? 0,
          })
        )

      setDenpaList(restoredData)

      setQrHistory(
        backupData.qrHistory ?? []
      )

      setSearchConditions(
        backupData.searchConditions ?? []
      )

      alert(
        'データを復元しました。'
      )
    } catch (error) {
      console.error(
        'バックアップファイルの読み込みに失敗しました:',
        error
      )

      alert(
        'バックアップファイルの読み込みに失敗しました。\n「denpa-backup-」から始まるJsonファイルを選択してください。'
      )
    }
  }

  reader.readAsText(file)
}