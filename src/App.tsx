import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import './App.css'
import QRCode from 'qrcode'

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

type SearchPageState = {
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

type QrHistory = {
  id: string
  qrData: string
  createdAt: number
}

const QR_DB_NAME = 'denpaQrDatabase'
const QR_STORE_NAME = 'qrFiles'

const openQrDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(QR_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(QR_STORE_NAME)) {
        db.createObjectStore(QR_STORE_NAME)
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

const saveQrFile = async (
  id: string,
  file: File
): Promise<void> => {
  const db = await openQrDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      QR_STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(QR_STORE_NAME)

    store.put(file, id)

    transaction.oncomplete = () => {
      db.close()
      resolve()
    }

    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

const getQrFile = async (
  id: string
): Promise<File | null> => {
  const db = await openQrDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      QR_STORE_NAME,
      'readonly'
    )

    const store = transaction.objectStore(QR_STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => {
      db.close()

      const file = request.result

      if (file instanceof File) {
        resolve(file)
        return
      }

      if (file instanceof Blob) {
        resolve(
          new File(
            [file],
            `${id}.png`,
            { type: file.type || 'image/png' }
          )
        )
        return
      }

      resolve(null)
    }

    request.onerror = () => {
      db.close()
      reject(request.error)
    }
  })
}

const saveDenpaList = async (
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

const dataUrlToFile = (
  dataUrl: string,
  fileName: string
): File => {
  const [header, base64] =
    dataUrl.split(',')

  const mimeMatch =
    header.match(/:(.*?);/)

  const mimeType =
    mimeMatch?.[1] ??
    'image/png'

  const binary =
    atob(base64)

  const bytes =
    new Uint8Array(
      binary.length
    )

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

const generateRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    )

    result += characters[randomIndex]
  }

  return result
}

const createBackupFile = async (
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

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `denpa-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`

  link.click()

  URL.revokeObjectURL(url)
}

const restoreBackupFile = (
  file: File,
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>,
  setQrHistory: Dispatch<SetStateAction<QrHistory[]>>,
  setSearchConditions: Dispatch<SetStateAction<SearchCondition[]>>
) => {
  const reader = new FileReader()

  reader.onload = () => {
    try {
      const backupData = JSON.parse(reader.result as string) as BackupData

      if (backupData.version !== 1) {
        alert('対応していないバックアップファイルです。')
        return
      }

      const restoredData: DenpaData[] = backupData.denpaList.map((item) => ({
        ...item,
        qrFile: item.qrFile
          ? dataUrlToFile(item.qrFile, `${item.name || 'denpa'}.png`)
          : null,
        createdAt: item.createdAt ?? 0,
      }))

      setDenpaList(restoredData)
      setQrHistory(backupData.qrHistory ?? [])
      setSearchConditions(backupData.searchConditions ?? [])

      alert('データを復元しました。')
    } catch (error) {
      console.error('バックアップファイルの読み込みに失敗しました:', error)
      alert('バックアップファイルの読み込みに失敗しました。\n「denpa-backup-」から始まるJsonファイルを選択してください。')
    }
  }

  reader.readAsText(file)
}

type SearchMatch = {
  required: string[]
  optional: string[]
}

const EVASION_OPTIONS = [
  "0", "3+", "3-", "6", "6-10", "10-15",
]

const BODY_OPTIONS = [
  "最速", "準速", "中間", "準大", "最大",
]

const COLOR_OPTIONS: Record<string, string[]> = {
  '黒色系': ["黒", "薄黒", "濃黒"],
  '赤色系': ["赤", "薄赤", "濃赤"],
  '青色系': ["青", "薄青", "濃青"],
  '黄色系': ["黄", "薄黄", "濃黄"],
  '橙色系': ["橙", "薄橙", "濃橙"],
  '緑色系': ["緑", "薄緑", "濃緑"],
  '水色系': ["水", "薄水", "濃水"],
  '紫色系': ["紫", "薄紫", "濃紫"],
  '白色系': ["白", "薄白", "濃白"],
}

const HEAD_OPTIONS = [
  "よこまる", "かどまる", "まる", "さんかく", "しかく", "たてまる",
]

const ANTENNA_OPTIONS: Record<string, string[]> = {
  'アンテナなし': ['アンテナなし'],
  '攻撃（火）': ['ひのたま', 'ばくはつ'],
  '攻撃（氷）': ['とがったこおり', 'ロックアイス'],
  '攻撃（風）': ['つむじかぜ', 'ビルかぜ'],
  '攻撃（土）': ['らくせき', 'いしつぶて'],
  '攻撃（電気）': ['せいでんき', 'いなづま'],
  '攻撃（水）': ['みずでっぽう', 'バケツのみず'],
  '攻撃（闇）': ['おどかす', 'ダークボール'],
  '攻撃（光）': ['よわいこうせん', 'スポットライト'],
  '攻撃（その他）': ['ノックダウン'],
  '回復': ['ちょっとかいふく'],
  '治療': [
    'ちょっとふっかつ',
    'ぜんぶなおす',
    'げどく',
    'しびれとる',
    'めざめる',
    'ぞくせいなおす'
  ],
  '増強': [
    'すこしはやくなれ',
    'すこしつよくなれ',
    'すこしかたくなれ',
    'すこしかわしやすい',
    'すこしこうふん',
    'すこしむてき',
    'たくわえる',
  ],
  '補助': [
    'すこしねむらせる',
    'すこししびれさせる',
    'すこしおそくなれ',
    'すこしやわくなれ',
    'すこしよわくなれ',
    'すこしめかくし',
    'どくになれ',
    'みんなすこしよけにくい',
  ],
  'お得': ['ちょっとあしもとガード'],
}

const FEATURE_OPTIONS = [
  "なし", "親子", "双子",
]

const BODY_TABLE_DATA: Record<
  string,
  {
    category: string
    antenna: string
    hp: number[]
  }[]
> = {
  '0': [
    {
      category: 'なし',
      antenna: 'アンテナなし',
      hp: [40, 37, 34, 32, 29],
    },
    {
      category: '攻撃',
      antenna: '単体属性攻撃',
      hp: [33, 31, 29, 27, 24],
    },
    {
      category: '〃',
      antenna: '３体属性攻撃',
      hp: [35, 33, 30, 28, 26],
    },
    {
      category: '〃',
      antenna: 'ノックダウン',
      hp: [38, 36, 33, 31, 28],
    },
    {
      category: '回復',
      antenna: 'ちょっとかいふく',
      hp: [41, 39, 36, 33, 31],
    },
    {
      category: '治療',
      antenna: 'ちょっとふっかつ',
      hp: [42, 40, 37, 35, 32],
    },
    {
      category: '〃',
      antenna: 'ぜんぶなおす',
      hp: [42, 40, 37, 35, 32],
    },
    {
      category: '〃',
      antenna: 'げどく',
      hp: [42, 39, 37, 34, 32],
    },
    {
      category: '〃',
      antenna: 'しびれとる',
      hp: [43, 41, 38, 36, 33],
    },
    {
      category: '〃',
      antenna: 'めざめる',
      hp: [43, 40, 38, 35, 33],
    },
    {
      category: '〃',
      antenna: 'ぞくせいなおす',
      hp: [42, 40, 37, 34, 32],
    },
    {
      category: '増強',
      antenna: 'すこしこうふん',
      hp: [37, 35, 32, 30, 27],
    },
    {
      category: '〃',
      antenna: 'すこしむてき',
      hp: [42, 40, 37, 35, 32],
    },
    {
      category: '〃',
      antenna: 'たくわえる',
      hp: [42, 39, 37, 35, 32],
    },
    {
      category: '〃',
      antenna: 'その他単体増強系',
      hp: [36, 34, 32, 30, 27],
    },
    {
      category: '補助',
      antenna: '補助系',
      hp: [37, 35, 32, 30, 27],
    },
    {
      category: 'お得',
      antenna: 'ちょっとあしもとガード',
      hp: [35, 32, 30, 27, 25],
    },
  ],

  '3+': [
    {
      category: 'なし',
      antenna: 'アンテナなし',
      hp: [37, 34, 32, 29, 26],
    },
    {
      category: '攻撃',
      antenna: '単体属性攻撃',
      hp: [31, 29, 27, 24, 22],
    },
    {
      category: '〃',
      antenna: '３体属性攻撃',
      hp: [33, 30, 28, 26, 23],
    },
    {
      category: '〃',
      antenna: 'ノックダウン',
      hp: [36, 33, 31, 28, 26],
    },
    {
      category: '回復',
      antenna: 'ちょっとかいふく',
      hp: [39, 36, 33, 31, 28],
    },
    {
      category: '治療',
      antenna: 'ちょっとふっかつ',
      hp: [40, 37, 35, 32, 30],
    },
    {
      category: '〃',
      antenna: 'ぜんぶなおす',
      hp: [40, 37, 35, 32, 30],
    },
    {
      category: '〃',
      antenna: 'げどく',
      hp: [39, 37, 34, 32, 29],
    },
    {
      category: '〃',
      antenna: 'しびれとる',
      hp: [41, 38, 36, 33, 31],
    },
    {
      category: '〃',
      antenna: 'めざめる',
      hp: [40, 38, 35, 33, 30],
    },
    {
      category: '〃',
      antenna: 'ぞくせいなおす',
      hp: [40, 37, 34, 32, 29],
    },
    {
      category: '増強',
      antenna: 'すこしこうふん',
      hp: [35, 32, 30, 27, 25],
    },
    {
      category: '〃',
      antenna: 'すこしむてき',
      hp: [40, 37, 35, 32, 30],
    },
    {
      category: '〃',
      antenna: 'たくわえる',
      hp: [39, 37, 35, 32, 30],
    },
    {
      category: '〃',
      antenna: 'その他単体増強系',
      hp: [34, 32, 30, 27, 25],
    },
    {
      category: '補助',
      antenna: '補助系',
      hp: [35, 32, 30, 27, 25],
    },
    {
      category: 'お得',
      antenna: 'ちょっとあしもとガード',
      hp: [32, 30, 27, 25, 22],
    },
  ],

  '3-': [
    {
      category: 'なし',
      antenna: 'アンテナなし',
      hp: [34, 32, 29, 26, 24],
    },
    {
      category: '攻撃',
      antenna: '単体属性攻撃',
      hp: [29, 27, 24, 22, 20],
    },
    {
      category: '〃',
      antenna: '３体属性攻撃',
      hp: [30, 28, 26, 23, 21],
    },
    {
      category: '〃',
      antenna: 'ノックダウン',
      hp: [33, 31, 28, 26, 23],
    },
    {
      category: '回復',
      antenna: 'ちょっとかいふく',
      hp: [36, 33, 31, 28, 26],
    },
    {
      category: '治療',
      antenna: 'ちょっとふっかつ',
      hp: [37, 35, 32, 30, 27],
    },
    {
      category: '〃',
      antenna: 'ぜんぶなおす',
      hp: [37, 35, 32, 30, 27],
    },
    {
      category: '〃',
      antenna: 'げどく',
      hp: [37, 34, 32, 29, 26],
    },
    {
      category: '〃',
      antenna: 'しびれとる',
      hp: [38, 36, 33, 31, 28],
    },
    {
      category: '〃',
      antenna: 'めざめる',
      hp: [38, 35, 33, 30, 27],
    },
    {
      category: '〃',
      antenna: 'ぞくせいなおす',
      hp: [37, 34, 32, 29, 27],
    },
    {
      category: '増強',
      antenna: 'すこしこうふん',
      hp: [32, 30, 27, 25, 22],
    },
    {
      category: '〃',
      antenna: 'すこしむてき',
      hp: [37, 35, 32, 30, 27],
    },
    {
      category: '〃',
      antenna: 'たくわえる',
      hp: [37, 35, 32, 30, 27],
    },
    {
      category: '〃',
      antenna: 'その他単体増強系',
      hp: [32, 30, 27, 25, 23],
    },
    {
      category: '補助',
      antenna: '補助系',
      hp: [32, 30, 27, 25, 22],
    },
    {
      category: 'お得',
      antenna: 'ちょっとあしもとガード',
      hp: [30, 27, 25, 22, 20],
    },
  ],

  '6': [
    {
      category: 'なし',
      antenna: 'アンテナなし',
      hp: [32, 29, 26, 26, 26,],
    },
    {
      category: '攻撃',
      antenna: '単体属性攻撃',
      hp: [27, 24, 22, 22, 22],
    },
    {
      category: '〃',
      antenna: '３体属性攻撃',
      hp: [28, 26, 23, 23, 23],
    },
    {
      category: '〃',
      antenna: 'ノックダウン',
      hp: [31, 28, 26, 26, 26],
    },
    {
      category: '回復',
      antenna: 'ちょっとかいふく',
      hp: [33, 31, 28, 28, 28],
    },
    {
      category: '治療',
      antenna: 'ちょっとふっかつ',
      hp: [35, 32, 30, 30, 30],
    },
    {
      category: '〃',
      antenna: 'ぜんぶなおす',
      hp: [35, 32, 30, 30, 30],
    },
    {
      category: '〃',
      antenna: 'げどく',
      hp: [34, 32, 29, 29, 29],
    },
    {
      category: '〃',
      antenna: 'しびれとる',
      hp: [36, 33, 31, 31, 31],
    },
    {
      category: '〃',
      antenna: 'めざめる',
      hp: [35, 33, 30, 30, 30],
    },
    {
      category: '〃',
      antenna: 'ぞくせいなおす',
      hp: [34, 32, 29, 29, 29],
    },
    {
      category: '増強',
      antenna: 'すこしこうふん',
      hp: [30, 27, 25, 25, 25],
    },
    {
      category: '〃',
      antenna: 'すこしむてき',
      hp: [35, 32, 30, 30, 30],
    },
    {
      category: '〃',
      antenna: 'たくわえる',
      hp: [35, 32, 30, 30, 30],
    },
    {
      category: '〃',
      antenna: 'その他単体増強系',
      hp: [27, 25, 23, 23, 23],
    },
    {
      category: '補助',
      antenna: '補助系',
      hp: [30, 27, 25, 25, 25],
    },
    {
      category: 'お得',
      antenna: 'ちょっとあしもとガード',
      hp: [27, 25, 22, 22, 22],
    },
  ],

  '6-10': [
    {
      category: 'なし',
      antenna: 'アンテナなし',
      hp: [29, 26, 24, 21, 18],
    },
    {
      category: '攻撃',
      antenna: '単体属性攻撃',
      hp: [24, 22, 20, 18, 15],
    },
    {
      category: '〃',
      antenna: '３体属性攻撃',
      hp: [26, 23, 21, 19, 16],
    },
    {
      category: '〃',
      antenna: 'ノックダウン',
      hp: [28, 26, 23, 21, 18],
    },
    {
      category: '回復',
      antenna: 'ちょっとかいふく',
      hp: [31, 28, 26, 23, 21],
    },
    {
      category: '治療',
      antenna: 'ちょっとふっかつ',
      hp: [32, 30, 27, 25, 22],
    },
    {
      category: '〃',
      antenna: 'ぜんぶなおす',
      hp: [32, 30, 27, 25, 22],
    },
    {
      category: '〃',
      antenna: 'げどく',
      hp: [32, 29, 26, 24, 21],
    },
    {
      category: '〃',
      antenna: 'しびれとる',
      hp: [33, 31, 28, 26, 23],
    },
    {
      category: '〃',
      antenna: 'めざめる',
      hp: [33, 30, 27, 25, 22],
    },
    {
      category: '〃',
      antenna: 'ぞくせいなおす',
      hp: [32, 29, 27, 24, 22],
    },
    {
      category: '増強',
      antenna: 'すこしこうふん',
      hp: [27, 25, 22, 20, 17],
    },
    {
      category: '〃',
      antenna: 'すこしむてき',
      hp: [32, 30, 27, 25, 22],
    },
    {
      category: '〃',
      antenna: 'たくわえる',
      hp: [32, 30, 27, 25, 22],
    },
    {
      category: '〃',
      antenna: 'その他単体増強系',
      hp: [25, 23, 21, 21, 18],
    },
    {
      category: '補助',
      antenna: '補助系',
      hp: [27, 25, 22, 20, 17],
    },
    {
      category: 'お得',
      antenna: 'ちょっとあしもとガード',
      hp: [25, 22, 20, 17, 15],
    },
  ],

  '10-15': [
    {
      category: 'なし',
      antenna: 'アンテナなし',
      hp: [26, 24, 21, 18, 16],
    },
    {
      category: '攻撃',
      antenna: '単体属性攻撃',
      hp: [22, 20, 18, 15, 13],
    },
    {
      category: '〃',
      antenna: '３体属性攻撃',
      hp: [23, 21, 19, 16, 14],
    },
    {
      category: '〃',
      antenna: 'ノックダウン',
      hp: [26, 23, 21, 18, 16],
    },
    {
      category: '回復',
      antenna: 'ちょっとかいふく',
      hp: [28, 26, 23, 21, 18],
    },
    {
      category: '治療',
      antenna: 'ちょっとふっかつ',
      hp: [30, 27, 25, 22, 20],
    },
    {
      category: '〃',
      antenna: 'ぜんぶなおす',
      hp: [30, 27, 25, 22, 20],
    },
    {
      category: '〃',
      antenna: 'げどく',
      hp: [29, 26, 24, 21, 19],
    },
    {
      category: '〃',
      antenna: 'しびれとる',
      hp: [31, 28, 26, 23, 21],
    },
    {
      category: '〃',
      antenna: 'めざめる',
      hp: [30, 27, 25, 22, 20],
    },
    {
      category: '〃',
      antenna: 'ぞくせいなおす',
      hp: [29, 27, 24, 22, 19],
    },
    {
      category: '増強',
      antenna: 'すこしこうふん',
      hp: [25, 22, 20, 17, 15],
    },
    {
      category: '〃',
      antenna: 'すこしむてき',
      hp: [30, 27, 25, 22, 20],
    },
    {
      category: '〃',
      antenna: 'たくわえる',
      hp: [30, 27, 25, 22, 20],
    },
    {
      category: '〃',
      antenna: 'その他単体増強系',
      hp: [23, 21, 21, 18, 16],
    },
    {
      category: '補助',
      antenna: '補助系',
      hp: [25, 22, 20, 17, 15],
    },
    {
      category: 'お得',
      antenna: 'ちょっとあしもとガード',
      hp: [22, 20, 17, 15, 12],
    },
  ],
}

const BODY_TABLE_EXCEPTIONS: Record<string, string> = {
  '単体属性攻撃':
    '該当アンテナ：ひのたま とがったこおり つむじかぜ らくせき せいでんき みずでっぽう おどかす よわいこうせん\n「ひのたま」「みずでっぽう」はHP+1\n「つむじかぜ」「よわいこうせん」は回避率+1',

  '３体属性攻撃':
    '該当アンテナ：ばくはつ ロックアイス ビルかぜ いしつぶて いなづま バケツのみず ダークボール スポットライト\n「ばくはつ」「バケツのみず」はHP+1\n「ビルかぜ」「スポットライト」は回避率+1',

  'ノックダウン':
    '回避率+1',

  'その他単体増強系':
    '該当アンテナ：すこしはやくなれ すこしつよくなれ すこしかたくなれ すこしかわしやすい\n「すこしかわしやすい」は回避率+2',

  '補助系':
    '該当アンテナ：すこしねむらせる すこししびれさせる すこしおそくなれ すこしやわくなれ すこしめかくし どくになれ みんなすこしよけにくい\n「みんなすこしよけにくい」は回避率+4',

  'ちょっとあしもとガード':
    '回避率+1',
}

function Home({
  denpaList,
  setDenpaList,
  qrHistory,
  searchConditions,
  setQrHistory,
  setSearchConditions,
}: {
  denpaList: DenpaData[]
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
  qrHistory: QrHistory[]
  searchConditions: SearchCondition[]
  setQrHistory: Dispatch<SetStateAction<QrHistory[]>>
  setSearchConditions: Dispatch<SetStateAction<SearchCondition[]>>
}) {
  const [backupFile, setBackupFile] = useState<File | null>(null)

  return (
    <div className="app">
      <header className="header">
        <h1>電波人間 QRコード管理ツール</h1>
      </header>

      <main className="home">
        <div className='home-backup'>
          <button className='backup-button'
            onClick={() => {
              const confirmed = window.confirm(
                '現在のデータのバックアップファイルをダウンロードしますか？'
              )

              if (!confirmed) {
                return
              }

              createBackupFile(
                denpaList,
                qrHistory,
                searchConditions
              )
            }}
          >
            バックアップ
          </button>

          <button className='restore-button'
            onClick={() => {
              if (!backupFile) {
                alert('バックアップファイルを選択してください。')
                return
              }

              const confirmed = window.confirm(
                'このバックアップファイルのデータを復元しますか？'
              )

              if (!confirmed) {
                return
              }

              restoreBackupFile(
                backupFile,
                setDenpaList,
                setQrHistory,
                setSearchConditions
              )
            }}
          >
            復元
          </button>

          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              setBackupFile(file)
            }}
          />

        </div>

        <div className="home-menu">
          <Link to="/save" className="menu-button">
            電波人間のステータスとQRコードを登録
          </Link>

          <Link to="/search" className="menu-button">
            登録した電波人間を検索
          </Link>
        </div>

      </main>
    </div>
  )
}

function QrHistory({
  qrHistory,
}: {
  qrHistory: QrHistory[]
}) {
  const location = useLocation()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)

  const itemsPerPage = 15
  const totalPages = Math.ceil(qrHistory.length / itemsPerPage)

  const startIndex = (page - 1) * itemsPerPage
  const currentHistory = qrHistory.slice(
    startIndex,
    startIndex + itemsPerPage
  )
  return (
    <div className="qr-history-page">
      <div className="qr-history-header">
        <button
          className="search-back-button"
          onClick={() => {
            navigate('/save', {
              state: {
                qrMode: location.state?.qrMode ?? 'select',
              },
            })
          }}
        >
          ⇦
        </button>

        <h2>QRコード生成履歴（直近300個）</h2>

        <div className="qr-history-pagination">
          <button
            onClick={() => setPage((currentPage) => currentPage - 1)}
            disabled={page === 1}
          >
            ←
          </button>

          <span>
            {page} / {totalPages || 1}
          </span>

          <button
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            →
          </button>
        </div>
      </div>

      <div className="qr-history-grid">
        {currentHistory.map((item) => (
          <div
            key={item.id}
            className="qr-history-item"
          >
            <p>
              {new Date(item.createdAt).toLocaleString('ja-JP')}
            </p>

            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = item.qrData
                link.download = `qr-${item.id}.png`
                link.click()
              }}
            >
              画像を保存
            </button>

            <img
              src={item.qrData}
              alt="生成したQRコード"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Save({
  setDenpaList,
  setQrHistory,
}: {
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
  setQrHistory: Dispatch<SetStateAction<QrHistory[]>>
}) {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [evasion, setEvasion] = useState('')
  const [body, setBody] = useState('')
  const [colorCategory, setColorCategory] = useState('')
  const [color, setColor] = useState('')
  const [head, setHead] = useState('')
  const [antennaCategory, setAntennaCategory] = useState('')
  const [antenna, setAntenna] = useState('')
  const [feature, setFeature] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const location = useLocation()

  const [qrMode, setQrMode] =
    useState<'select' | 'generate'>(
      location.state?.qrMode ?? 'select'
    )

  const [generatedQr, setGeneratedQr] = useState<string | null>(null)
  const [qrLength, setQrLength] = useState(100)
  const [qrDecided, setQrDecided] = useState(false)
  const [qrGenerationCount, setQrGenerationCount] = useState(0)
  const [bodyTableEvasion, setBodyTableEvasion] = useState('0')
  const [hoveredCell, setHoveredCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const BODY_TYPES = ['最大', '準大', '中間', '準速', '最速']

  const handleBodyTableClick = (
    antenna: string,
    bodyType: string
  ) => {
    setEvasion(bodyTableEvasion)
    setBody(bodyType)

    if (antenna === 'アンテナなし') {
      setAntennaCategory('アンテナなし')
      setAntenna('アンテナなし')
    } else if (antenna === '単体属性攻撃') {
      setAntennaCategory('攻撃（火）')
      setAntenna('ひのたま')
    } else if (antenna === '３体属性攻撃') {
      setAntennaCategory('攻撃（火）')
      setAntenna('ばくはつ')
    } else if (antenna === 'ノックダウン') {
      setAntennaCategory('攻撃（その他）')
      setAntenna('ノックダウン')
    } else if (antenna === 'ちょっとかいふく') {
      setAntennaCategory('回復')
      setAntenna('ちょっとかいふく')
    } else if (antenna === 'ちょっとふっかつ') {
      setAntennaCategory('治療')
      setAntenna('ちょっとふっかつ')
    } else if (antenna === 'ぜんぶなおす') {
      setAntennaCategory('治療')
      setAntenna('ぜんぶなおす')
    } else if (antenna === 'げどく') {
      setAntennaCategory('治療')
      setAntenna('げどく')
    } else if (antenna === 'しびれとる') {
      setAntennaCategory('治療')
      setAntenna('しびれとる')
    } else if (antenna === 'めざめる') {
      setAntennaCategory('治療')
      setAntenna('めざめる')
    } else if (antenna === 'ぞくせいなおす') {
      setAntennaCategory('治療')
      setAntenna('ぞくせいなおす')
    } else if (antenna === 'すこしこうふん') {
      setAntennaCategory('増強')
      setAntenna('すこしこうふん')
    } else if (antenna === 'すこしむてき') {
      setAntennaCategory('増強')
      setAntenna('すこしむてき')
    } else if (antenna === 'たくわえる') {
      setAntennaCategory('増強')
      setAntenna('たくわえる')
    } else if (antenna === 'その他単体増強系') {
      setAntennaCategory('増強')
      setAntenna('すこしはやくなれ')
    } else if (antenna === '補助系') {
      setAntennaCategory('補助')
      setAntenna('すこしねむらせる')
    } else if (antenna === 'ちょっとあしもとガード') {
      setAntennaCategory('お得')
      setAntenna('ちょっとあしもとガード')
    }
  }


  const handleSave = () => {
    const unsetItems: string[] = []

    if (!name) {
      unsetItems.push('名前')
    }

    if (!evasion) {
      unsetItems.push('回避率')
    }

    if (!body) {
      unsetItems.push('体格')
    }

    if (!colorCategory || !color) {
      unsetItems.push('色')
    }

    if (!head) {
      unsetItems.push('頭')
    }

    if (!antennaCategory || !antenna) {
      unsetItems.push('アンテナ')
    }

    if (!feature) {
      unsetItems.push('特徴')
    }

    if (!qrFile) {
      unsetItems.push('QRコード')
    }

    if (unsetItems.length > 0) {
      const shouldSave = window.confirm(
        `${unsetItems.join('、')}が設定されていません。\n\n保存しますか？`
      )

      if (!shouldSave) {
        return
      }
    }

    const denpaData: DenpaData = {
      id: crypto.randomUUID(),
      name,
      evasion,
      body,
      colorCategory,
      color,
      head,
      antennaCategory,
      antenna,
      feature,
      capture: false,
      favorite: false,
      createdAt: Date.now(),
      qrFile,
    }

    setDenpaList((currentList) => [
      ...currentList,
      denpaData,
    ])

    console.log('登録する電波人間データ')
    console.log(denpaData)

    alert('新しい電波人間のデータを登録しました。')

    setName('')
    setEvasion('')
    setBody('')
    setColorCategory('')
    setColor('')
    setHead('')
    setAntennaCategory('')
    setAntenna('')
    setFeature('')
  }



  return (
    <div className="app">
      <main className="save-page">
        <div className="save-title">
          <button
            className="search-back-button"
            onClick={() => navigate('/')}
          >
            ⇦
          </button>

          <h2>電波人間のデータを登録</h2>
        </div>

        <div className="save-layout">
          <div className="save-left">
            <div className="save-qr-area">
              <div className="qr-top-area">
                <div className="qr-mode-control">
                  <label htmlFor="qr-mode">QRコード</label>

                  <select
                    id="qr-mode"
                    value={qrMode}
                    onChange={(e) => {
                      const newMode = e.target.value as 'select' | 'generate'

                      setQrFile(null)
                      setGeneratedQr(null)
                      setQrDecided(false)

                      setQrMode(newMode)
                    }}
                  >
                    <option value="select">選択モード</option>
                    <option value="generate">生成モード</option>
                  </select>
                </div>

                {qrMode === 'select' && (
                  <div className="qr-input">
                    <input
                      id="qr"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setQrFile(e.target.files?.[0] ?? null)
                      }}
                    />

                    {qrFile && (
                      <img
                        className="qr-preview"
                        src={URL.createObjectURL(qrFile)}
                        alt="選択したQRコード"
                      />
                    )}
                  </div>
                )}
              </div>

              {qrMode === 'generate' && (
                <div className="qr-generate-area">

                  <div className="qr-length-control">
                    <label htmlFor="qr-length">
                      情報量：
                    </label>

                    <select
                      id="qr-length"
                      value={qrLength}
                      onChange={(e) => {
                        setQrLength(Number(e.target.value))
                      }}
                    >
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                      <option value={400}>400</option>
                      <option value={500}>500</option>
                    </select>
                  </div>

                  <div className="qr-generate-buttons">
                    <button
                      onClick={async () => {
                        const qrData = generateRandomString(qrLength)
                        const qrImage = await QRCode.toDataURL(qrData)
                        setQrGenerationCount((count) => count + 1)

                        const newHistory: QrHistory = {
                          id: crypto.randomUUID(),
                          qrData: qrImage,
                          createdAt: Date.now(),
                        }

                        setQrHistory((currentHistory) => [
                          newHistory,
                          ...currentHistory,
                        ].slice(0, 300))

                        setGeneratedQr(qrImage)
                        setQrDecided(false)
                      }}
                      disabled={qrDecided}
                    >
                      QRコードを生成
                    </button>

                    <button
                      onClick={async () => {
                        if (qrDecided) {
                          setQrFile(null)
                          setQrDecided(false)
                          return
                        }

                        if (!generatedQr) {
                          return
                        }

                        const [, base64] = generatedQr.split(',')

                        const binary = atob(base64)
                        const bytes = new Uint8Array(binary.length)

                        for (let i = 0; i < binary.length; i++) {
                          bytes[i] = binary.charCodeAt(i)
                        }

                        const file = new File(
                          [bytes],
                          `generated-${Date.now()}.png`,
                          { type: 'image/png' }
                        )

                        setQrFile(file)
                        setQrDecided(true)
                      }}
                      disabled={!generatedQr}
                    >
                      {qrDecided
                        ? '決定を解除'
                        : 'このQRコードで決定'}
                    </button>

                    <button
                      onClick={() =>
                        navigate('/qr-history', {
                          state: {
                            qrMode,
                          },
                        })
                      }
                    >
                      履歴（直近300個）
                    </button>
                  </div>

                  {generatedQr && (
                    <div className="qr-generated-preview">
                      <p className="qr-generation-count">
                        生成回数：{qrGenerationCount}回
                      </p>

                      <img
                        className="qr-preview qr-generated-preview"
                        src={generatedQr}
                        alt="生成したQRコード"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="save-input-area">

              <div className="form">
                <div className="form-row">
                  <label htmlFor="name">名前</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="evasion">回避率</label>

                  <select
                    id="evasion"
                    value={evasion}
                    onChange={(e) => setEvasion(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {EVASION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="body">体格</label>

                  <select
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {BODY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>色</label>

                  <div className="select-group">
                    <select
                      value={colorCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value
                        setColorCategory(newCategory)
                        if (newCategory === '') {
                          setColor('')
                        } else {
                          setColor(COLOR_OPTIONS[newCategory][0])
                        }
                      }}
                    >
                      <option value="">選択してください</option>

                      {Object.keys(COLOR_OPTIONS).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      disabled={!colorCategory}
                    >
                      {colorCategory &&
                        COLOR_OPTIONS[colorCategory].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="evasion">頭</label>

                  <select
                    id="head"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {HEAD_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>アンテナ</label>

                  <div className="select-group">
                    <select
                      value={antennaCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value
                        setAntennaCategory(newCategory)
                        if (newCategory === '') {
                          setAntenna('')
                        } else {
                          setAntenna(ANTENNA_OPTIONS[newCategory][0])
                        }
                      }}
                    >
                      <option value="">選択してください</option>

                      {Object.keys(ANTENNA_OPTIONS).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={antenna}
                      onChange={(e) =>
                        setAntenna(e.target.value)
                      }
                      disabled={!antennaCategory}
                    >

                      {antennaCategory &&
                        ANTENNA_OPTIONS[
                          antennaCategory
                        ].map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="evasion">特徴</label>

                  <select
                    id="feature"
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {FEATURE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                >
                  登録する
                </button>
              </div>

            </div>

          </div>

          <div className="save-body-table">
            <div className="body-table-header">
              <h3>レベル１体格表（数値はHP）</h3>

              <div className="body-table-evasion">
                <label htmlFor="body-table-evasion">
                  回避率
                </label>

                <select
                  id="body-table-evasion"
                  value={bodyTableEvasion}
                  onChange={(e) => {
                    setBodyTableEvasion(e.target.value)
                  }}
                >
                  {EVASION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="body-table">
              <thead>
                <tr>
                  <th>カテゴリー</th>
                  <th>アンテナ</th>
                  <th>最大</th>
                  <th>準大</th>
                  <th>中間</th>
                  <th>準速</th>
                  <th>最速</th>
                </tr>
              </thead>

              <tbody>
                {BODY_TABLE_DATA[bodyTableEvasion] ? (
                  BODY_TABLE_DATA[bodyTableEvasion].map((item, rowIndex) => (
                    <tr key={item.antenna}>
                      <td>{item.category}</td>
                      <td className="body-table-antenna-cell">
                        {item.antenna}

                        {BODY_TABLE_EXCEPTIONS[item.antenna] && (
                          <span className="body-table-exception-mark">
                            i
                            <span className="body-table-tooltip">
                              {BODY_TABLE_EXCEPTIONS[item.antenna]
                                .split('\n')
                                .map((text, index) => (
                                  <span key={index}>
                                    {index > 0 && <br />}
                                    {text}
                                  </span>
                                ))}
                            </span>
                          </span>
                        )}
                      </td>

                      {Array.isArray(item.hp) &&
                        item.hp.map(
                          (value, index) => (

                            <td
                              key={index}
                              className={
                                hoveredCell?.row ===
                                  rowIndex &&
                                  hoveredCell?.col ===
                                  index
                                  ? 'body-table-cell-hover'
                                  : hoveredCell?.row ===
                                    rowIndex ||
                                    hoveredCell?.col ===
                                    index
                                    ? 'body-table-line-hover'
                                    : ''
                              }
                              onMouseEnter={() => {
                                setHoveredCell({
                                  row: rowIndex,
                                  col: index,
                                })
                              }}
                              onMouseLeave={() => {
                                setHoveredCell(null)
                              }}
                              onClick={() => {
                                handleBodyTableClick(
                                  item.antenna,
                                  BODY_TYPES[index]
                                )
                              }}
                            >
                              {value}
                            </td>

                          )
                        )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      この回避率のデータは未登録です。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  )
}

function Edit({
  denpaList,
  setDenpaList,
}: {
  denpaList: DenpaData[]
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
}) {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const searchPageState =
    location.state?.from === 'search'
      ? (location.state.searchPageState as SearchPageState)
      : null

  const denpa = denpaList.find(
    (item) => item.id === id
  )

  const [name, setName] = useState(denpa?.name ?? '')
  const [evasion, setEvasion] = useState(denpa?.evasion ?? '')
  const [body, setBody] = useState(denpa?.body ?? '')
  const [colorCategory, setColorCategory] = useState(
    denpa?.colorCategory ?? ''
  )
  const [color, setColor] = useState(denpa?.color ?? '')
  const [head, setHead] = useState(denpa?.head ?? '')
  const [antennaCategory, setAntennaCategory] = useState(
    denpa?.antennaCategory ?? ''
  )
  const [antenna, setAntenna] = useState(
    denpa?.antenna ?? ''
  )
  const [feature, setFeature] = useState(
    denpa?.feature ?? ''
  )
  const [qrFile, setQrFile] = useState<File | null>(
    denpa?.qrFile ?? null
  )
  const [bodyTableEvasion, setBodyTableEvasion] = useState(
    denpa?.evasion || EVASION_OPTIONS[0]
  )

  const [hoveredCell, setHoveredCell] = useState<{
    row: number
    col: number
  } | null>(null)

  const BODY_TYPES = ['最大', '準大', '中間', '準速', '最速']

  const handleBodyTableClick = (
    antenna: string,
    bodyType: string
  ) => {
    setEvasion(bodyTableEvasion)
    setBody(bodyType)

    if (antenna === 'アンテナなし') {
      setAntennaCategory('アンテナなし')
      setAntenna('アンテナなし')
    } else if (antenna === '単体属性攻撃') {
      setAntennaCategory('攻撃（火）')
      setAntenna('ひのたま')
    } else if (antenna === '３体属性攻撃') {
      setAntennaCategory('攻撃（火）')
      setAntenna('ばくはつ')
    } else if (antenna === 'ノックダウン') {
      setAntennaCategory('攻撃（その他）')
      setAntenna('ノックダウン')
    } else if (antenna === 'ちょっとかいふく') {
      setAntennaCategory('回復')
      setAntenna('ちょっとかいふく')
    } else if (antenna === 'ちょっとふっかつ') {
      setAntennaCategory('治療')
      setAntenna('ちょっとふっかつ')
    } else if (antenna === 'ぜんぶなおす') {
      setAntennaCategory('治療')
      setAntenna('ぜんぶなおす')
    } else if (antenna === 'げどく') {
      setAntennaCategory('治療')
      setAntenna('げどく')
    } else if (antenna === 'しびれとる') {
      setAntennaCategory('治療')
      setAntenna('しびれとる')
    } else if (antenna === 'めざめる') {
      setAntennaCategory('治療')
      setAntenna('めざめる')
    } else if (antenna === 'ぞくせいなおす') {
      setAntennaCategory('治療')
      setAntenna('ぞくせいなおす')
    } else if (antenna === 'すこしこうふん') {
      setAntennaCategory('増強')
      setAntenna('すこしこうふん')
    } else if (antenna === 'すこしむてき') {
      setAntennaCategory('増強')
      setAntenna('すこしむてき')
    } else if (antenna === 'たくわえる') {
      setAntennaCategory('増強')
      setAntenna('たくわえる')
    } else if (antenna === 'その他単体増強系') {
      setAntennaCategory('増強')
      setAntenna('すこしはやくなれ')
    } else if (antenna === '補助系') {
      setAntennaCategory('補助')
      setAntenna('すこしねむらせる')
    } else if (antenna === 'ちょっとあしもとガード') {
      setAntennaCategory('お得')
      setAntenna('ちょっとあしもとガード')
    }
  }

  if (!denpa) {
    return (
      <div className="app">
        <main className="list-page">
          <h2>データが見つかりません</h2>

          <Link
            to="/search"
            className="back-button"
          >
            検索画面に戻る
          </Link>
        </main>
      </div>
    )
  }

  const handleUpdate = () => {
    const unsetItems: string[] = []

    if (!name) {
      unsetItems.push('名前')
    }

    if (!evasion) {
      unsetItems.push('回避率')
    }

    if (!body) {
      unsetItems.push('体格')
    }

    if (!colorCategory || !color) {
      unsetItems.push('色')
    }

    if (!head) {
      unsetItems.push('頭')
    }

    if (!antennaCategory || !antenna) {
      unsetItems.push('アンテナ')
    }

    if (!feature) {
      unsetItems.push('特徴')
    }

    if (!qrFile) {
      unsetItems.push('QRコード')
    }

    if (unsetItems.length > 0) {
      const shouldUpdate = window.confirm(
        `${unsetItems.join('、')}が設定されていません。\n\n更新しますか？`
      )

      if (!shouldUpdate) {
        return false
      }
    }

    setDenpaList((currentList) =>
      currentList.map((item) =>
        item.id === denpa.id
          ? {
            ...item,
            name,
            evasion,
            body,
            colorCategory,
            color,
            head,
            antennaCategory,
            antenna,
            feature,
            qrFile,
          }
          : item
      )
    )

    return true
  }

  return (
    <div className="app">
      <main className="save-page">

        <div className="save-title">
          <button
            type="button"
            className="search-back-button"
            onClick={() => {
              navigate('/search', {
                state: searchPageState
                  ? {
                    fromEdit: true,
                    searchPageState,
                  }
                  : undefined,
              })
            }}
          >
            ⇦
          </button>

          <h2>電波人間のデータを編集</h2>
        </div>

        <div className="save-layout">

          <div className="save-left">

            {/* QRコード */}
            <div className="save-qr-area">

              <div className="qr-top-area">

                <div className="qr-mode-control">
                  <label htmlFor="edit-qr">
                    QRコード
                  </label>
                </div>

                <div className="qr-input">

                  <input
                    id="edit-qr"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setQrFile(
                        e.target.files?.[0] ?? null
                      )
                    }}
                  />

                  <img
                    className="qr-preview"
                    src={
                      qrFile
                        ? URL.createObjectURL(qrFile)
                        : '/denpa-qr-web/no-image.jpg'
                    }
                    alt={qrFile ? 'QRコード' : 'QRコード未設定'}
                  />

                </div>

              </div>

            </div>

            {/* ステータス */}
            <div className="save-input-area">

              <div className="form">

                <div className="form-row">
                  <label htmlFor="edit-name">
                    名前
                  </label>

                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="edit-evasion">
                    回避率
                  </label>

                  <select
                    id="edit-evasion"
                    value={evasion}
                    onChange={(e) =>
                      setEvasion(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {EVASION_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="edit-body">
                    体格
                  </label>

                  <select
                    id="edit-body"
                    value={body}
                    onChange={(e) =>
                      setBody(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {BODY_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>色</label>

                  <div className="select-group">

                    <select
                      value={colorCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value

                        setColorCategory(newCategory)

                        if (newCategory === '') {
                          setColor('')
                        } else {
                          setColor(
                            COLOR_OPTIONS[newCategory][0]
                          )
                        }
                      }}
                    >
                      <option value="">
                        選択してください
                      </option>

                      {Object.keys(
                        COLOR_OPTIONS
                      ).map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={color}
                      onChange={(e) =>
                        setColor(e.target.value)
                      }
                      disabled={!colorCategory}
                    >

                      {colorCategory &&
                        COLOR_OPTIONS[colorCategory]?.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}
                    </select>

                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="edit-head">
                    頭
                  </label>

                  <select
                    id="edit-head"
                    value={head}
                    onChange={(e) =>
                      setHead(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {HEAD_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>アンテナ</label>

                  <div className="select-group">

                    <select
                      value={antennaCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value

                        setAntennaCategory(newCategory)

                        if (newCategory === '') {
                          setAntenna('')
                        } else {
                          setAntenna(
                            ANTENNA_OPTIONS[newCategory][0]
                          )
                        }
                      }}
                    >
                      <option value="">
                        選択してください
                      </option>

                      {Object.keys(
                        ANTENNA_OPTIONS
                      ).map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={antenna}
                      onChange={(e) =>
                        setAntenna(e.target.value)
                      }
                      disabled={!antennaCategory}
                    >

                      {antennaCategory &&
                        ANTENNA_OPTIONS[
                          antennaCategory
                        ].map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}
                    </select>

                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="edit-feature">
                    特徴
                  </label>

                  <select
                    id="edit-feature"
                    value={feature}
                    onChange={(e) =>
                      setFeature(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {FEATURE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="form-buttons">

                <button
                  type="button"
                  className="save-button"
                  onClick={() => {
                    const updated = handleUpdate()

                    if (!updated) {
                      return
                    }

                    navigate('/search', {
                      state: searchPageState
                        ? {
                          fromEdit: true,
                          searchPageState,
                        }
                        : undefined,
                    })
                  }}
                >
                  更新して戻る
                </button>

              </div>

            </div>

          </div>

          {/* 体格表 */}
          <div className="save-body-table">

            <div className="body-table-header">

              <h3>レベル１体格表（数値はHP）</h3>

              <div className="body-table-evasion">

                <label htmlFor="body-table-evasion">
                  回避率
                </label>

                <select
                  id="body-table-evasion"
                  value={bodyTableEvasion}
                  onChange={(e) => {
                    setBodyTableEvasion(
                      e.target.value
                    )
                  }}
                >
                  {EVASION_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>

              </div>

            </div>

            <table className="body-table">

              <thead>
                <tr>
                  <th>カテゴリー</th>
                  <th>アンテナ</th>
                  <th>最大</th>
                  <th>準大</th>
                  <th>中間</th>
                  <th>準速</th>
                  <th>最速</th>
                </tr>
              </thead>

              <tbody>

                {BODY_TABLE_DATA[bodyTableEvasion] ? (
                  BODY_TABLE_DATA[
                    bodyTableEvasion
                  ].map((item, rowIndex) => (

                    <tr key={item.antenna}>

                      <td>
                        {item.category}
                      </td>

                      <td className="body-table-antenna-cell">

                        {item.antenna}

                        {BODY_TABLE_EXCEPTIONS[
                          item.antenna
                        ] && (
                            <span className="body-table-exception-mark">
                              i

                              <span className="body-table-tooltip">

                                {BODY_TABLE_EXCEPTIONS[
                                  item.antenna
                                ]
                                  .split('\n')
                                  .map(
                                    (
                                      text,
                                      index
                                    ) => (
                                      <span
                                        key={index}
                                      >
                                        {index > 0 && (
                                          <br />
                                        )}

                                        {text}
                                      </span>
                                    )
                                  )}

                              </span>
                            </span>
                          )}

                      </td>

                      {item.hp.map(
                        (value, index) => (

                          <td
                            key={index}
                            className={
                              hoveredCell?.row ===
                                rowIndex &&
                                hoveredCell?.col ===
                                index
                                ? 'body-table-cell-hover'
                                : hoveredCell?.row ===
                                  rowIndex ||
                                  hoveredCell?.col ===
                                  index
                                  ? 'body-table-line-hover'
                                  : ''
                            }
                            onMouseEnter={() => {
                              setHoveredCell({
                                row: rowIndex,
                                col: index,
                              })
                            }}
                            onMouseLeave={() => {
                              setHoveredCell(null)
                            }}
                            onClick={() => {
                              handleBodyTableClick(
                                item.antenna,
                                BODY_TYPES[index]
                              )
                            }}
                          >
                            {value}
                          </td>

                        )
                      )}

                    </tr>

                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      この回避率のデータは未登録です。
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>
    </div>
  )
}

function Search({
  denpaList,
  setDenpaList,
  searchConditions,
  setSearchConditions,
}: {
  denpaList: DenpaData[]
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
  searchConditions: SearchCondition[]
  setSearchConditions: Dispatch<SetStateAction<SearchCondition[]>>
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const handleDelete = (id: string) => {
    const target = denpaList.find(
      (denpa) => denpa.id === id
    )

    if (!target) {
      return
    }

    const confirmed = window.confirm(
      `「${target.name || '名前未設定'}」を削除しますか？`
    )

    if (!confirmed) {
      return
    }

    setDenpaList((currentList) =>
      currentList.filter(
        (denpa) => denpa.id !== id
      )
    )
  }

  const [uuid, setUuid] = useState('')
  const [name, setName] = useState('')
  const [evasion, setEvasion] = useState('')
  const [body, setBody] = useState('')
  const [colorCategory, setColorCategory] = useState('')
  const [color, setColor] = useState('')
  const [head, setHead] = useState('')
  const [antennaCategory, setAntennaCategory] = useState('')
  const [antenna, setAntenna] = useState('')
  const [feature, setFeature] = useState('')
  const [captureSearch, setCaptureSearch] = useState('')
  const [favoriteSearch, setFavoriteSearch] = useState('')
  const [sortMode, setSortMode] = useState<'new' | 'old' | 'name'>('new')
  const [currentPage, setCurrentPage] = useState(() => {
    if (location.state?.fromEdit === true) {
      const restoredState =
        location.state.searchPageState as SearchPageState

      return restoredState.currentPage
    }

    return 1
  })
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [conditionMode, setConditionMode] = useState<
    'none' | 'register' | 'load'
  >('none')
  const [conditionName, setConditionName] = useState('')
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null)
  const [editingConditionName, setEditingConditionName] = useState('')
  const [conditionSort, setConditionSort] = useState<
    'new' | 'old' | 'name'
  >('new')


  const [nameRequired, setNameRequired] = useState(true)
  const [evasionRequired, setEvasionRequired] = useState(true)
  const [bodyRequired, setBodyRequired] = useState(true)
  const [colorRequired, setColorRequired] = useState(true)
  const [headRequired, setHeadRequired] = useState(true)
  const [antennaRequired, setAntennaRequired] = useState(true)
  const [featureRequired, setFeatureRequired] = useState(true)

  const [optionalMin, setOptionalMin] = useState(0)

  const [expandedQr, setExpandedQr] = useState<DenpaData | null>(null)

  useEffect(() => {
    if (!expandedQr) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedQr(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedQr])

  useEffect(() => {
    if (location.state?.fromEdit !== true) {
      return
    }

    const restoredState =
      location.state.searchPageState as SearchPageState

    setUuid(restoredState.uuid)
    setName(restoredState.name)
    setEvasion(restoredState.evasion)
    setBody(restoredState.body)
    setColorCategory(restoredState.colorCategory)
    setColor(restoredState.color)
    setHead(restoredState.head)
    setAntennaCategory(restoredState.antennaCategory)
    setAntenna(restoredState.antenna)
    setFeature(restoredState.feature)
    setCaptureSearch(restoredState.captureSearch)
    setFavoriteSearch(restoredState.favoriteSearch)

    setNameRequired(restoredState.nameRequired)
    setEvasionRequired(restoredState.evasionRequired)
    setBodyRequired(restoredState.bodyRequired)
    setColorRequired(restoredState.colorRequired)
    setHeadRequired(restoredState.headRequired)
    setAntennaRequired(restoredState.antennaRequired)
    setFeatureRequired(restoredState.featureRequired)

    setOptionalMin(restoredState.optionalMin)
    setItemsPerPage(restoredState.itemsPerPage)
    setSortMode(restoredState.sortMode)
    setCurrentPage(restoredState.currentPage)
  }, [location.state])

  useEffect(() => {
  }, [currentPage])

  const optionalConditionCount =
    (name !== '' && !nameRequired ? 1 : 0) +
    (evasion !== '' && !evasionRequired ? 1 : 0) +
    (body !== '' && !bodyRequired ? 1 : 0) +
    (
      (colorCategory !== '' || color !== '') &&
        !colorRequired
        ? 1
        : 0
    ) +
    (head !== '' && !headRequired ? 1 : 0) +
    (
      (antennaCategory !== '' || antenna !== '') &&
        !antennaRequired
        ? 1
        : 0
    ) +
    (feature !== '' && !featureRequired ? 1 : 0)

  useEffect(() => {
    setOptionalMin((currentMin) =>
      Math.min(currentMin, optionalConditionCount)
    )
  }, [optionalConditionCount])

  const searchResults = denpaList
    .map((denpa) => {

      if (uuid !== '') {
        if (denpa.id === uuid) {
          return {
            denpa,
            match: {
              required: [],
              optional: [],
            },
          }
        }

        return null
      }

      const requiredMatches: string[] = []
      const optionalMatches: string[] = []

      // ========================================
      // 検索条件が指定されているか
      // ========================================

      const nameSpecified = name !== ''
      const evasionSpecified = evasion !== ''
      const bodySpecified = body !== ''
      const colorCategorySpecified = colorCategory !== ''
      const colorSpecified = color !== ''
      const headSpecified = head !== ''
      const antennaCategorySpecified = antennaCategory !== ''
      const antennaSpecified = antenna !== ''
      const featureSpecified = feature !== ''

      // ========================================
      // 色の一致判定
      // ========================================

      let colorMatches = false

      if (colorSpecified) {
        // 色まで指定されている場合
        colorMatches = denpa.color === color
      } else if (colorCategorySpecified) {
        // 色カテゴリだけ指定されている場合
        colorMatches =
          COLOR_OPTIONS[colorCategory]?.includes(
            denpa.color
          ) ?? false
      }

      // ========================================
      // アンテナの一致判定
      // ========================================

      let antennaMatches = false

      if (antennaSpecified) {
        // アンテナまで指定されている場合
        antennaMatches =
          denpa.antenna === antenna
      } else if (antennaCategorySpecified) {
        // アンテナカテゴリだけ指定されている場合
        antennaMatches =
          ANTENNA_OPTIONS[antennaCategory]?.includes(
            denpa.antenna
          ) ?? false
      }

      // ========================================
      // 必須条件
      // ========================================

      if (nameSpecified && nameRequired) {
        if (
          denpa.name
            .toLowerCase()
            .includes(name.toLowerCase())
        ) {
          requiredMatches.push('名前')
        } else {
          return null
        }
      }

      if (evasionSpecified && evasionRequired) {
        if (denpa.evasion === evasion) {
          requiredMatches.push('回避率')
        } else {
          return null
        }
      }

      if (bodySpecified && bodyRequired) {
        if (denpa.body === body) {
          requiredMatches.push('体格')
        } else {
          return null
        }
      }

      if (
        (colorCategorySpecified || colorSpecified) &&
        colorRequired
      ) {
        if (colorMatches) {
          requiredMatches.push('色')
        } else {
          return null
        }
      }

      if (headSpecified && headRequired) {
        if (denpa.head === head) {
          requiredMatches.push('頭')
        } else {
          return null
        }
      }

      if (
        (antennaCategorySpecified ||
          antennaSpecified) &&
        antennaRequired
      ) {
        if (antennaMatches) {
          requiredMatches.push('アンテナ')
        } else {
          return null
        }
      }

      if (featureSpecified && featureRequired) {
        if (denpa.feature === feature) {
          requiredMatches.push('特徴')
        } else {
          return null
        }
      }



      // ========================================
      // 任意条件
      // ========================================

      if (nameSpecified && !nameRequired) {
        if (
          denpa.name
            .toLowerCase()
            .includes(name.toLowerCase())
        ) {
          optionalMatches.push('名前')
        }
      }

      if (
        evasionSpecified &&
        !evasionRequired
      ) {
        if (denpa.evasion === evasion) {
          optionalMatches.push('回避率')
        }
      }

      if (bodySpecified && !bodyRequired) {
        if (denpa.body === body) {
          optionalMatches.push('体格')
        }
      }

      if (
        (colorCategorySpecified ||
          colorSpecified) &&
        !colorRequired
      ) {
        if (colorMatches) {
          optionalMatches.push('色')
        }
      }

      if (headSpecified && !headRequired) {
        if (denpa.head === head) {
          optionalMatches.push('頭')
        }
      }

      if (
        (antennaCategorySpecified ||
          antennaSpecified) &&
        !antennaRequired
      ) {
        if (antennaMatches) {
          optionalMatches.push('アンテナ')
        }
      }

      if (
        featureSpecified &&
        !featureRequired
      ) {
        if (denpa.feature === feature) {
          optionalMatches.push('特徴')
        }
      }

      if (captureSearch !== '') {
        if (String(denpa.capture) !== captureSearch) {
          return null
        }
      }

      if (favoriteSearch !== '') {
        if (String(denpa.favorite) !== favoriteSearch) {
          return null
        }
      }

      // ========================================
      // 任意条件の最低一致数を確認
      // ========================================

      if (
        optionalConditionCount > 0 &&
        optionalMatches.length < optionalMin
      ) {
        return null
      }

      return {
        denpa,
        match: {
          required: requiredMatches,
          optional: optionalMatches,
        },
      }
    })
    .filter(
      (
        result
      ): result is {
        denpa: DenpaData
        match: SearchMatch
      } => result !== null
    )

  const sortedSearchResults = [...searchResults].sort((a, b) => {
    if (sortMode === 'new') {
      return b.denpa.createdAt - a.denpa.createdAt
    }

    if (sortMode === 'old') {
      return a.denpa.createdAt - b.denpa.createdAt
    }

    return a.denpa.name.localeCompare(b.denpa.name, 'ja')
  })

  const totalPages = Math.ceil(sortedSearchResults.length / itemsPerPage)

  const paginatedSearchResults = sortedSearchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const clearSearchConditions = () => {
    setName('')
    setUuid('')
    setEvasion('')
    setBody('')
    setColorCategory('')
    setColor('')
    setHead('')
    setAntennaCategory('')
    setAntenna('')
    setFeature('')

    setNameRequired(true)
    setEvasionRequired(true)
    setBodyRequired(true)
    setColorRequired(true)
    setHeadRequired(true)
    setAntennaRequired(true)
    setFeatureRequired(true)

    setOptionalMin(0)
  }

  return (
    <div className="app">

      <main className="list-page">

        {/* 左側：検索条件 */}
        <aside className="list-sidebar search-sidebar">

          <div className="search-title-row">
            <Link to="/" className="search-back-button">
              ⇦
            </Link>
            <h2>電波人間を検索</h2>
          </div>

          <div className="search-form">

            <div className="form-row">
              <label htmlFor="search-uuid">
                UUID
              </label>

              <input
                id="search-uuid"
                type="text"
                value={uuid}
                onChange={(e) => {
                  setUuid(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="特定の１体を検索できます"
              />

              <button
                type="button"
                onClick={clearSearchConditions}
              >
                検索条件をクリア
              </button>

            </div>

            <div className="form-row">
              <label htmlFor="search-name">
                名前
              </label>

              <input
                id="search-name"
                type="text"
                value={name}
                onChange={(e) => {
                  const value = e.target.value

                  setName(value)
                  setCurrentPage(1)

                  if (value === '') {
                    setNameRequired(true)
                  }
                }}
                placeholder="名前の一部でも検索できます"
              />

              {name && (
                <button
                  type="button"
                  className={
                    nameRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setNameRequired(!nameRequired)
                    setCurrentPage(1)
                  }}
                >
                  {nameRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="form-row">
              <label htmlFor="search-evasion">
                回避率
              </label>

              <select
                id="search-evasion"
                value={evasion}
                onChange={(e) => {
                  setEvasion(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">
                  指定なし
                </option>

                {EVASION_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              {evasion && (
                <button
                  type="button"
                  className={
                    evasionRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setEvasionRequired(!evasionRequired)
                    setCurrentPage(1)
                  }}
                >
                  {evasionRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="form-row">
              <label htmlFor="search-body">
                体格
              </label>

              <select
                id="search-body"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">
                  指定なし
                </option>

                {BODY_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              {body && (
                <button
                  type="button"
                  className={
                    bodyRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setBodyRequired(!bodyRequired)
                    setCurrentPage(1)
                  }}
                >
                  {bodyRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="form-row">
              <label>
                色
              </label>

              <div className="select-group">

                <select
                  value={colorCategory}
                  onChange={(e) => {
                    const newCategory =
                      e.target.value

                    setColorCategory(newCategory)
                    setColor('')
                    setCurrentPage(1)

                    if (newCategory === '') {
                      setColorRequired(true)
                    }
                  }}
                >
                  <option value="">
                    指定なし
                  </option>

                  {Object.keys(COLOR_OPTIONS).map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <span>＞</span>

                <select
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value)
                    setCurrentPage(1)
                  }}
                  disabled={!colorCategory}
                >
                  <option value="">
                    指定なし
                  </option>

                  {colorCategory &&
                    COLOR_OPTIONS[
                      colorCategory
                    ].map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                </select>

              </div>

              {colorCategory !== '' && (
                <button
                  type="button"
                  className={
                    colorRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setColorRequired(!colorRequired)
                    setCurrentPage(1)
                  }}
                >
                  {colorRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="form-row">
              <label htmlFor="search-head">
                頭
              </label>

              <select
                id="search-head"
                value={head}
                onChange={(e) => {
                  setHead(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">
                  指定なし
                </option>

                {HEAD_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              {head && (
                <button
                  type="button"
                  className={
                    headRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setHeadRequired(!headRequired)
                    setCurrentPage(1)
                  }}
                >
                  {headRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="form-row">
              <label>
                アンテナ
              </label>

              <div className="select-group">

                <select
                  value={antennaCategory}
                  onChange={(e) => {
                    const newCategory =
                      e.target.value

                    setAntennaCategory(
                      newCategory
                    )

                    setAntenna('')
                    setCurrentPage(1)

                    if (newCategory === '') {
                      setAntennaRequired(true)
                    }
                  }}
                >
                  <option value="">
                    指定なし
                  </option>

                  {Object.keys(
                    ANTENNA_OPTIONS
                  ).map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <span>＞</span>

                <select
                  value={antenna}
                  onChange={(e) => {
                    setAntenna(e.target.value)
                    setCurrentPage(1)
                  }}
                  disabled={!antennaCategory}
                >
                  <option value="">
                    指定なし
                  </option>

                  {antennaCategory &&
                    ANTENNA_OPTIONS[
                      antennaCategory
                    ].map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                </select>

              </div>

              {antennaCategory !== '' && (
                <button
                  type="button"
                  className={
                    antennaRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setAntennaRequired(!antennaRequired)
                    setCurrentPage(1)
                  }}
                >
                  {antennaRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="form-row">
              <label htmlFor="search-feature">
                特徴
              </label>

              <select
                id="search-feature"
                value={feature}
                onChange={(e) => {
                  setFeature(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">
                  指定なし
                </option>

                {FEATURE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              {feature && (
                <button
                  type="button"
                  className={
                    featureRequired
                      ? "condition-button required"
                      : "condition-button optional"
                  }
                  onClick={() => {
                    setFeatureRequired(!featureRequired)
                    setCurrentPage(1)
                  }}
                >
                  {featureRequired ? "必須" : "任意"}
                </button>
              )}
            </div>

            <div className="search-field">
              <label>
                任意項目：
              </label>

              <select
                value={optionalMin}
                onChange={(e) => {
                  setOptionalMin(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                {Array.from(
                  { length: optionalConditionCount + 1 },
                  (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  )
                )}
              </select>

              <span>個以上一致</span>
            </div>

            <div className="search-condition-buttons">

              <button
                type="button"
                onClick={() => setConditionMode('register')}
              >
                現在の検索条件を登録する
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedConditionId(null)
                  setEditingConditionName('')
                  setConditionMode('load')
                }}
              >
                登録した検索条件を使う
              </button>
            </div>

          </div>

        </aside>

        {/* 右側 */}
        <section className="list-content">

          {/* 右上 */}
          <div className="list-pagination">
            {conditionMode === 'register' ? null : conditionMode === 'load' ? (
              <div className="condition-mode-title">
                <button
                  type="button"
                  className="condition-back-button"
                  onClick={() => {
                    setSelectedConditionId(null)
                    setEditingConditionName('')
                    setConditionMode('none')
                  }}
                  aria-label="検索画面に戻る"
                  title="戻る"
                >
                  ⇦
                </button>

                <h2>登録した検索条件を呼び出します</h2>
              </div>
            ) : (
              <>
                <div className="sort-control">
                  <label>
                    並び順：
                    <select
                      value={sortMode}
                      onChange={(e) => {
                        setSortMode(e.target.value as 'new' | 'old' | 'name')
                        setCurrentPage(1)
                      }}
                    >
                      <option value="new">新しく登録した順</option>
                      <option value="old">古く登録した順</option>
                      <option value="name">名前順</option>
                    </select>
                  </label>
                </div>

                <button
                  className="pagination-button"
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  disabled={currentPage === 1}
                >
                  ⇦
                </button>

                <span>
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  className="pagination-button"
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  disabled={
                    currentPage === totalPages ||
                    totalPages === 0
                  }
                >
                  ⇨
                </button>

                <div className="items-per-page-control">
                  <label>
                    表示件数：
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* 右下：検索結果 */}
          <div className="list-cards">

            {conditionMode === 'register' ? (
              <div className="condition-register">
                <h3>現在の検索条件をお気に入り登録できます</h3>

                <label>
                  登録名：
                  <input
                    type="text"
                    value={conditionName}
                    onChange={(e) => setConditionName(e.target.value)}
                  />
                </label>

                <div className="condition-register-buttons">
                  <button
                    type="button"
                    onClick={() => {
                      if (conditionName.trim() === '') {
                        alert('登録名を入力してください')
                        return
                      }

                      const newCondition: SearchCondition = {
                        id: crypto.randomUUID(),
                        name: conditionName.trim(),
                        uuid,
                        searchName: name,
                        evasion,
                        body,
                        colorCategory,
                        color,
                        head,
                        antennaCategory,
                        antenna,
                        feature,
                        nameRequired,
                        evasionRequired,
                        bodyRequired,
                        colorRequired,
                        headRequired,
                        antennaRequired,
                        featureRequired,
                        optionalMin,
                        createdAt: Date.now(),
                      }

                      console.log('newCondition作成直後:', newCondition)

                      setSearchConditions((currentConditions) => {
                        const updatedConditions = [
                          ...currentConditions,
                          newCondition,
                        ]

                        console.log('登録するnewCondition:', newCondition)
                        console.log('登録するoptionalMin:', newCondition.optionalMin)

                        localStorage.setItem(
                          'searchConditions',
                          JSON.stringify(updatedConditions)
                        )

                        console.log(
                          'localStorage保存後:',
                          JSON.parse(localStorage.getItem('searchConditions') || '[]')
                        )

                        return updatedConditions
                      })

                      setConditionName('')
                      setConditionMode('none')

                      alert('検索条件をお気に入り登録しました')
                    }}
                  >
                    登録する
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConditionName('')
                      setConditionMode('none')
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : conditionMode === 'load' ? (
              <div className="condition-load">
                <div className="condition-load-sort">
                  <label>
                    並び順：
                    <select
                      value={conditionSort}
                      onChange={(event) =>
                        setConditionSort(
                          event.target.value as 'new' | 'old' | 'name'
                        )
                      }
                    >
                      <option value="new">新しい順</option>
                      <option value="old">古い順</option>
                      <option value="name">登録名順</option>
                    </select>
                  </label>
                </div>

                <div className="condition-load-content">
                  <div className="condition-load-list">
                    {searchConditions.length === 0 ? (
                      <p>登録した検索条件はありません。</p>
                    ) : (
                      [...searchConditions]
                        .sort((a, b) => {
                          if (conditionSort === 'new') {
                            return b.createdAt - a.createdAt
                          }

                          if (conditionSort === 'old') {
                            return a.createdAt - b.createdAt
                          }

                          return a.name.localeCompare(b.name, 'ja')
                        })
                        .map((condition) => (
                          <div
                            key={condition.id}
                            className="condition-load-item"
                          >
                            <button
                              type="button"
                              className="condition-load-item-name"
                              onClick={() => {
                                setSelectedConditionId(condition.id)
                                setEditingConditionName(condition.name)
                              }}
                            >
                              {condition.name}
                            </button>

                            <button
                              type="button"
                              className="condition-load-delete-button"
                              onClick={() => {
                                const shouldDelete = window.confirm(
                                  `「${condition.name}」を削除しますか？`
                                )

                                if (!shouldDelete) {
                                  return
                                }

                                setSearchConditions((currentConditions) => {
                                  const updatedConditions = currentConditions.filter(
                                    (item) => item.id !== condition.id
                                  )

                                  localStorage.setItem(
                                    'searchConditions',
                                    JSON.stringify(updatedConditions)
                                  )

                                  return updatedConditions
                                })

                                if (selectedConditionId === condition.id) {
                                  setSelectedConditionId(null)
                                  setEditingConditionName('')
                                }

                              }}
                              aria-label={`${condition.name}を削除`}
                              title="検索条件を削除"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  d="M5 7H19"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />

                                <path
                                  d="M10 7V5H14V7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                <path
                                  d="M8 7L9 20H15L16 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                <path
                                  d="M10 11V16"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />

                                <path
                                  d="M14 11V16"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="condition-load-detail">
                    {selectedConditionId === null ? (
                      <p>検索条件を選択してください。</p>
                    ) : (
                      (() => {
                        const selectedCondition = searchConditions.find(
                          (condition) => condition.id === selectedConditionId
                        )

                        if (!selectedCondition) {
                          return <p>検索条件を選択してください。</p>
                        }

                        return (
                          <>
                            <div className="condition-load-name">
                              <input
                                type="text"
                                value={editingConditionName}
                                onChange={(event) => setEditingConditionName(event.target.value)}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  if (editingConditionName.trim() === '') {
                                    alert('登録名を入力してください')
                                    return
                                  }

                                  setSearchConditions((currentConditions) => {
                                    const updatedConditions = currentConditions.map((condition) =>
                                      condition.id === selectedCondition.id
                                        ? {
                                          ...condition,
                                          name: editingConditionName.trim(),
                                        }
                                        : condition
                                    )

                                    localStorage.setItem(
                                      'searchConditions',
                                      JSON.stringify(updatedConditions)
                                    )

                                    return updatedConditions
                                  })

                                  alert('登録名を変更しました')
                                }}
                              >
                                登録名を変更
                              </button>

                            </div>

                            <div className="condition-preview">
                              <div className="condition-preview-row">
                                <span className="condition-preview-label">UUID</span>
                                <span className="condition-preview-colon">：</span>
                                <span className="condition-preview-value">
                                  {selectedCondition.uuid || '指定なし'}
                                </span>
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">名前</span>
                                <span className="condition-preview-colon">：</span>
                                <span
                                  className={
                                    selectedCondition.searchName
                                      ? selectedCondition.nameRequired
                                        ? 'search-match search-match-required'
                                        : 'search-match search-match-optional'
                                      : 'condition-preview-value'
                                  }
                                >
                                  {selectedCondition.searchName || '指定なし'}
                                </span>
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">回避率</span>
                                <span className="condition-preview-colon">：</span>
                                <span
                                  className={
                                    selectedCondition.evasion
                                      ? selectedCondition.evasionRequired
                                        ? 'search-match search-match-required'
                                        : 'search-match search-match-optional'
                                      : 'condition-preview-value'
                                  }
                                >
                                  {selectedCondition.evasion || '指定なし'}
                                </span>
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">体格</span>
                                <span className="condition-preview-colon">：</span>
                                <span
                                  className={
                                    selectedCondition.body
                                      ? selectedCondition.bodyRequired
                                        ? 'search-match search-match-required'
                                        : 'search-match search-match-optional'
                                      : 'condition-preview-value'
                                  }
                                >
                                  {selectedCondition.body || '指定なし'}
                                </span>
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">色</span>
                                <span className="condition-preview-colon">：</span>

                                {(selectedCondition.colorCategory || selectedCondition.color) ? (
                                  <>
                                    <span
                                      className={
                                        selectedCondition.colorRequired
                                          ? 'search-match search-match-required'
                                          : 'search-match search-match-optional'
                                      }
                                    >
                                      {selectedCondition.colorCategory || '指定なし'}
                                    </span>

                                    <span>　＞　</span>

                                    <span
                                      className={
                                        selectedCondition.colorRequired
                                          ? 'search-match search-match-required'
                                          : 'search-match search-match-optional'
                                      }
                                    >
                                      {selectedCondition.color || '指定なし'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="condition-preview-value">
                                    指定なし
                                  </span>
                                )}
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">頭</span>
                                <span className="condition-preview-colon">：</span>
                                <span
                                  className={
                                    selectedCondition.head
                                      ? selectedCondition.headRequired
                                        ? 'search-match search-match-required'
                                        : 'search-match search-match-optional'
                                      : 'condition-preview-value'
                                  }
                                >
                                  {selectedCondition.head || '指定なし'}
                                </span>
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">アンテナ</span>
                                <span className="condition-preview-colon">：</span>

                                {(selectedCondition.antennaCategory || selectedCondition.antenna) ? (
                                  <>
                                    <span
                                      className={
                                        selectedCondition.antennaRequired
                                          ? 'search-match search-match-required'
                                          : 'search-match search-match-optional'
                                      }
                                    >
                                      {selectedCondition.antennaCategory || '指定なし'}
                                    </span>

                                    <span>　＞　</span>

                                    <span
                                      className={
                                        selectedCondition.antennaRequired
                                          ? 'search-match search-match-required'
                                          : 'search-match search-match-optional'
                                      }
                                    >
                                      {selectedCondition.antenna || '指定なし'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="condition-preview-value">
                                    指定なし
                                  </span>
                                )}
                              </div>

                              <div className="condition-preview-row">
                                <span className="condition-preview-label">特徴</span>
                                <span className="condition-preview-colon">：</span>
                                <span
                                  className={
                                    selectedCondition.feature
                                      ? selectedCondition.featureRequired
                                        ? 'search-match search-match-required'
                                        : 'search-match search-match-optional'
                                      : 'condition-preview-value'
                                  }
                                >
                                  {selectedCondition.feature || '指定なし'}
                                </span>
                              </div>

                              <div className="condition-preview-optional-min">
                                任意項目：{selectedCondition.optionalMin}個以上一致
                              </div>
                            </div>

                            <button className='condition-apply-button'
                              type="button"
                              onClick={() => {
                                setUuid(selectedCondition.uuid)
                                setName(selectedCondition.searchName)
                                setEvasion(selectedCondition.evasion)
                                setBody(selectedCondition.body)
                                setColorCategory(selectedCondition.colorCategory)
                                setColor(selectedCondition.color)
                                setHead(selectedCondition.head)
                                setAntennaCategory(selectedCondition.antennaCategory)
                                setAntenna(selectedCondition.antenna)
                                setFeature(selectedCondition.feature)

                                setNameRequired(selectedCondition.nameRequired)
                                setEvasionRequired(selectedCondition.evasionRequired)
                                setBodyRequired(selectedCondition.bodyRequired)
                                setColorRequired(selectedCondition.colorRequired)
                                setHeadRequired(selectedCondition.headRequired)
                                setAntennaRequired(selectedCondition.antennaRequired)
                                setFeatureRequired(selectedCondition.featureRequired)

                                setOptionalMin(selectedCondition.optionalMin)

                                setConditionMode('none')
                                setSelectedConditionId(null)
                              }}
                            >
                              この検索条件を適用する
                            </button>

                          </>
                        )
                      })()
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <>
                <div className="search-summary">

                  <div className="search-summary-item search-result-count">
                    <span>
                      検索結果：{searchResults.length}件
                    </span>
                  </div>

                  <div className="search-summary-item">
                    <span>捕獲：</span>

                    <select
                      value={captureSearch}
                      onChange={(e) => {
                        setCaptureSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">
                        指定なし
                      </option>

                      <option value="true">
                        捕獲済み
                      </option>

                      <option value="false">
                        未捕獲
                      </option>
                    </select>

                  </div>


                  <div className="search-summary-item">
                    <span>お気に入り：</span>

                    <select
                      value={favoriteSearch}
                      onChange={(e) => {
                        setFavoriteSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">
                        指定なし
                      </option>

                      <option value="true">
                        お気に入り
                      </option>

                      <option value="false">
                        お気に入りではない
                      </option>
                    </select>

                  </div>

                </div>

                {searchResults.length === 0 ? (

                  <p>条件に一致する電波人間はいません。</p>

                ) : (

                  <div className="denpa-list">

                    {paginatedSearchResults.map(
                      (result) => {

                        const denpa = result.denpa
                        const match = result.match

                        const getMatchClass =
                          (field: string) => {
                            if (
                              match.required.includes(
                                field
                              )
                            ) {
                              return 'search-match search-match-required'
                            }

                            if (
                              match.optional.includes(
                                field
                              )
                            ) {
                              return 'search-match search-match-optional'
                            }

                            return ''
                          }

                        return (
                          <div
                            className="denpa-card"
                            key={denpa.id}
                          >

                            <div className="denpa-info">

                              <div className="name-uuid-row">

                                <button
                                  type="button"
                                  className={`favorite-star ${denpa.favorite
                                    ? 'active'
                                    : ''
                                    }`}
                                  onClick={() => {
                                    setDenpaList(
                                      (currentList) =>
                                        currentList.map(
                                          (item) =>
                                            item.id ===
                                              denpa.id
                                              ? {
                                                ...item,
                                                favorite:
                                                  !item.favorite,
                                              }
                                              : item
                                        )
                                    )
                                  }}
                                  aria-label="お気に入り"
                                  title="お気に入り"
                                >
                                  ★
                                </button>

                                <h3 className="denpa-name">
                                  <span
                                    className={getMatchClass(
                                      '名前'
                                    )}
                                  >
                                    {denpa.name ||
                                      '名前未設定'}
                                  </span>
                                </h3>

                              </div>

                              <p className="denpa-status">
                                回避率：
                                <span
                                  className={getMatchClass(
                                    '回避率'
                                  )}
                                >
                                  {denpa.evasion ||
                                    '未設定'}
                                </span>
                              </p>

                              <p className="denpa-status">
                                体格：
                                <span
                                  className={getMatchClass(
                                    '体格'
                                  )}
                                >
                                  {denpa.body ||
                                    '未設定'}
                                </span>
                              </p>

                              <p className="denpa-status">
                                色：
                                <span
                                  className={getMatchClass(
                                    '色'
                                  )}
                                >
                                  {denpa.colorCategory || '未設定'}
                                  {' ＞ '}
                                  {denpa.color || '未設定'}
                                </span>
                              </p>

                              <p className="denpa-status">
                                頭：
                                <span
                                  className={getMatchClass(
                                    '頭'
                                  )}
                                >
                                  {denpa.head ||
                                    '未設定'}
                                </span>
                              </p>

                              <p className="denpa-status">
                                アンテナ：
                                <span
                                  className={getMatchClass(
                                    'アンテナ'
                                  )}
                                >
                                  {denpa.antennaCategory || '未設定'}
                                  {' ＞ '}
                                  {denpa.antenna || '未設定'}
                                </span>
                              </p>

                              <p className="denpa-status">
                                特徴：
                                <span
                                  className={getMatchClass(
                                    '特徴'
                                  )}
                                >
                                  {denpa.feature ||
                                    '未設定'}
                                </span>
                              </p>

                            </div>

                            <div className="card-side">

                              <div className="qr-area">

                                <div className="denpa-uuid">

                                  <span>
                                    UUID: {denpa.id.slice(0, 12)}...
                                  </span>

                                  <button
                                    type="button"
                                    className="copy-button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(denpa.id)
                                      alert('UUIDをコピーしました')
                                    }}
                                    aria-label="UUIDをコピー"
                                    title="UUIDをコピー"
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                    >
                                      <rect
                                        x="9"
                                        y="9"
                                        width="11"
                                        height="11"
                                        rx="2"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />

                                      <path
                                        d="M15 9V6C15 4.89543 14.1046 4 13 4H6C4.89543 4 4 4.89543 4 6V13C4 14.1046 4.89543 15 6 15H9"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />
                                    </svg>
                                  </button>

                                </div>


                                <div
                                  className={`qr-image-wrapper ${denpa.capture ? 'captured' : ''
                                    }`}
                                  onClick={() => {
                                    setDenpaList((currentList) =>
                                      currentList.map((item) =>
                                        item.id === denpa.id
                                          ? {
                                            ...item,
                                            capture: !item.capture,
                                          }
                                          : item
                                      )
                                    )
                                  }}
                                >
                                  <img
                                    className="list-qr"
                                    src={
                                      denpa.qrFile
                                        ? URL.createObjectURL(denpa.qrFile)
                                        : '/denpa-qr-web/no-image.jpg'
                                    }
                                    alt={
                                      denpa.qrFile
                                        ? `${denpa.name}のQRコード`
                                        : 'QR画像なし'
                                    }
                                  />

                                  <button
                                    type="button"
                                    className="qr-expand-button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setExpandedQr(denpa)
                                    }}
                                    aria-label="QRコードを拡大"
                                    title="QRコードを拡大"
                                  >
                                    ⛶
                                  </button>

                                  {denpa.capture && (
                                    <div className="captured-label">
                                      捕獲済み
                                    </div>
                                  )}
                                </div>

                              </div>


                              <div className="card-buttons">

                                <button
                                  type="button"
                                  className="edit-button"
                                  onClick={() =>
                                    navigate(`/edit/${denpa.id}`, {
                                      state: {
                                        from: 'search', searchPageState: {
                                          uuid,
                                          name,
                                          evasion,
                                          body,
                                          colorCategory,
                                          color,
                                          head,
                                          antennaCategory,
                                          antenna,
                                          feature,
                                          captureSearch,
                                          favoriteSearch,
                                          sortMode,
                                          currentPage,
                                          itemsPerPage,
                                          nameRequired,
                                          evasionRequired,
                                          bodyRequired,
                                          colorRequired,
                                          headRequired,
                                          antennaRequired,
                                          featureRequired,
                                          optionalMin,
                                        } satisfies SearchPageState,
                                      },
                                    })
                                  }
                                >

                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />

                                    <path
                                      d="M13.5 6.5L17.5 10.5"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>


                                <button
                                  type="button"
                                  className="delete-button"
                                  onClick={() =>
                                    handleDelete(denpa.id)
                                  }
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M5 7H19"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />

                                    <path
                                      d="M10 7V5H14V7"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />

                                    <path
                                      d="M8 7L9 20H15L16 7"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />

                                    <path
                                      d="M10 11V16"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />

                                    <path
                                      d="M14 11V16"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>

                              </div>

                            </div>

                          </div>
                        )
                      }
                    )}

                  </div>

                )}

              </>
            )}

          </div>

        </section>

        {expandedQr && (
          <div
            className="qr-modal-overlay"
            onClick={() => setExpandedQr(null)}
          >
            <div
              className="qr-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="qr-modal-close"
                onClick={() => setExpandedQr(null)}
                aria-label="閉じる"
                title="閉じる"
              >
                ×
              </button>

              <img
                className="qr-modal-image"
                src={
                  expandedQr.qrFile
                    ? URL.createObjectURL(expandedQr.qrFile)
                    : '/denpa-qr-web/no-image.jpg'
                }
                alt={
                  expandedQr.qrFile
                    ? `${expandedQr.name}のQRコード`
                    : 'QR画像なし'
                }
              />

              <div className="qr-modal-name">
                {expandedQr.name || '名前未設定'}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  )
}

function App() {
  const [denpaList, setDenpaList] =
    useState<DenpaData[]>([])

  const [isDenpaListLoaded, setIsDenpaListLoaded] = useState(false)

  const [qrHistory, setQrHistory] = useState<QrHistory[]>(() => {
    const savedHistory = localStorage.getItem('qrHistory')

    if (!savedHistory) {
      return []
    }

    try {
      return JSON.parse(savedHistory) as QrHistory[]
    } catch (error) {
      console.error(
        'QRコード生成履歴の読み込みに失敗しました:',
        error
      )

      return []
    }
  })

  const [searchConditions, setSearchConditions] =
    useState<SearchCondition[]>(() => {
      const saved = localStorage.getItem('searchConditions')
      return saved ? JSON.parse(saved) : []
    })
  // ========================================
  // localStorageからデータを読み込む
  // ========================================

  useEffect(() => {
    const loadDenpaList = async () => {
      const savedData =
        localStorage.getItem('denpaList')

      if (!savedData) {
        setIsDenpaListLoaded(true)
        return
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

        setDenpaList(restoredData)
      } catch (error) {
        console.error(
          'データの読み込みに失敗しました:',
          error
        )
      }

      setIsDenpaListLoaded(true)
    }

    loadDenpaList()
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'qrHistory',
      JSON.stringify(qrHistory)
    )
  }, [qrHistory])

  // ========================================
  // denpaListが変更されたら保存する
  // ========================================

  useEffect(() => {
    if (!isDenpaListLoaded) {
      return
    }

    const saveData = async () => {
      try {
        await saveDenpaList(denpaList)
      } catch (error) {
        console.error(
          'データの保存に失敗しました:',
          error
        )
      }
    }

    saveData()
  }, [denpaList, isDenpaListLoaded])

  return (
    <BrowserRouter basename="/denpa-qr-web">
      <Routes>

        <Route
          path="/"
          element={
            <Home
              denpaList={denpaList}
              setDenpaList={setDenpaList}
              qrHistory={qrHistory}
              searchConditions={searchConditions}
              setQrHistory={setQrHistory}
              setSearchConditions={setSearchConditions}
            />
          }
        />

        <Route
          path="/save"
          element={
            <Save
              setDenpaList={setDenpaList}
              setQrHistory={setQrHistory}
            />
          }
        />

        <Route
          path="/edit/:id"
          element={
            <Edit
              denpaList={denpaList}
              setDenpaList={setDenpaList}
            />
          }
        />

        <Route
          path="/search"
          element={
            <Search
              denpaList={denpaList}
              setDenpaList={setDenpaList}
              searchConditions={searchConditions}
              setSearchConditions={setSearchConditions}
            />
          }
        />

        <Route
          path="/qr-history"
          element={
            <QrHistory
              qrHistory={qrHistory}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App