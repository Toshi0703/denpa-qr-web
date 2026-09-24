import type { QrHistory } from '../types/qr'

const QR_HISTORY_KEY = 'qrHistory'

export const loadQrHistory = (): QrHistory[] => {
  const savedHistory =
    localStorage.getItem(QR_HISTORY_KEY)

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
}

export const saveQrHistory = (
  qrHistory: QrHistory[]
): void => {
  localStorage.setItem(
    QR_HISTORY_KEY,
    JSON.stringify(qrHistory)
  )
}