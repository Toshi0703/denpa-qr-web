export type Announcement = {
  id: string
  date: string
  title: string
  body: string[]
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '2026-10-01-release',
    date: '2026/10/01',
    title: 'サイト公開のお知らせ',
    body: [
      '「電波人間 QRコード管理ツール」を公開しました。',
      '電波人間の登録・検索・QRコード管理などに利用できます。',
    ],
  },
]