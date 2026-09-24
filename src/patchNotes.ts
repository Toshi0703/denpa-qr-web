export type PatchNote = {
  version: string
  date: string
  changes: string[]
}

export const PATCH_NOTES: PatchNote[] = [
  {
    version: 'v1.0.0',
    date: '2026/09/24',
    changes: [
      '「電波人間QRコード管理ツール」を公開しました。今後も様々なアップデートを予定しています。',
    ],
  },
]