import { useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import { PATCH_NOTES } from '../patchNotes'
import { ANNOUNCEMENTS } from '../announcements'

import {
  createBackupFile,
  restoreBackupFile,
} from '../utils/backup'

import type { DenpaData } from '../types/denpa'

import type { SearchCondition } from '../types/search'

import type { QrHistory } from '../types/qr'

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
  const [homeInfoTab, setHomeInfoTab] = useState<'patch' | 'announcement'>('patch')

  const [lastViewedPatchNoteId, setLastViewedPatchNoteId] = useState(
    () => localStorage.getItem('lastViewedPatchNoteId') ?? ''
  )

  const [lastViewedAnnouncementId, setLastViewedAnnouncementId] = useState(
    () => localStorage.getItem('lastViewedAnnouncementId') ?? ''
  )

  const latestPatchNoteId =
    PATCH_NOTES.length > 0
      ? PATCH_NOTES[0].version
      : ''

  const latestAnnouncementId =
    ANNOUNCEMENTS.length > 0
      ? ANNOUNCEMENTS[0].id
      : ''

  const hasNewPatchNote =
    latestPatchNoteId !== '' &&
    latestPatchNoteId !== lastViewedPatchNoteId

  const hasNewAnnouncement =
    latestAnnouncementId !== '' &&
    latestAnnouncementId !== lastViewedAnnouncementId

  return (
    <div className="app">
      <Header />

      <main className="home">

        <div className="home-column home-data-column">
          <div className="home-backup">
            <h2 className="home-data-title">データ管理</h2>

            <p>
              端末変更やブラウザのデータ削除に備えて、<br></br>
              定期的にバックアップを作成することを推奨します。
            </p>

            <div className="home-data-section">
              <p>バックアップファイルをダウンロードします。</p>

              <button
                type="button"
                className="backup-button"
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
            </div>

            <div className="home-data-section">
              <p>バックアップファイルから復元します。</p>

              <div className="home-restore-controls">
                <button
                  type="button"
                  className="restore-button"
                  disabled={!backupFile}
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
            </div>
          </div>

          <div className="home-site-info">
            <h2 className="home-site-info-title">
              このサイトについて
            </h2>

            <p>
              本サイトは、「New 電波人間のRPG FREE!」を元にした
              非公式のファン制作ツールです。
              ゲーム公式・運営元とは一切関係ありません。
            </p>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSehthL8D7VP7phxC3GslrwAYboR0HOs__rxX3m7OgNevZj42w/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="home-site-info-link"
            >
              バグ報告・要望フォーム
            </a>

            <Link
              to="/terms"
              className="home-site-info-link"
            >
              利用規約
            </Link>

            <Link
              to="/privacy"
              className="home-site-info-link"
            >
              プライバシーポリシー
            </Link>

            <Link
              to="/rights"
              className="home-site-info-link"
            >
              権利・ライセンスについて
            </Link>

          </div>

        </div>

        <div className="home-column home-main-column">

          <div className="home-tool-description">
            <h2>このツールについて</h2>

            <p>
              電波人間のステータスとQRコードを登録し、
              条件を指定して検索できる管理ツールです。<br></br>
              登録した電波人間の情報やQRコード画像は、お使いのブラウザ内に保存されます。
            </p>
          </div>

          <div className="home-menu">

            <div className="home-menu-item">
              <Link to="/save" className="home-main-button">
                ＋ 電波人間を登録
              </Link>

              <p className="home-feature-description">
                電波人間の名前やステータス、QRコードを登録できます。<br></br>
                QRコードを生成することもできます。
              </p>
            </div>

            <div className="home-menu-item">
              <Link to="/search" className="home-main-button">
                🔍 電波人間を検索
              </Link>

              <p className="home-feature-description">
                登録した電波人間を、条件を指定して検索できます。<br></br>
                お気に入り、捕獲済みかどうかの指定もできます。
              </p>
            </div>

            <div className="home-menu-item">
              <div className="home-development-button-wrapper">
                <Link
                  to="/birth-route"
                  className="home-main-button home-development-button"
                >
                  🧬 出生ルートを登録
                </Link>

                <span className="home-development-badge">
                  開発中
                </span>
              </div>

              <p className="home-feature-description">
                出生ルートを保存・管理できます。<br></br>
                現在開発中です。
              </p>
            </div>

          </div>

        </div>

        <div className="home-column">
          <div className="home-patch-notes">

            <div className="home-info-tabs">
              <button
                type="button"
                className={homeInfoTab === 'patch' ? 'active' : ''}
                onClick={() => {
                  setHomeInfoTab('patch')

                  const latestId =
                    PATCH_NOTES.length > 0
                      ? PATCH_NOTES[0].version
                      : ''

                  setLastViewedPatchNoteId(latestId)
                  localStorage.setItem('lastViewedPatchNoteId', latestId)
                }}
              >
                <span className="home-info-tab-label">
                  パッチノート
                  {hasNewPatchNote && (
                    <span className="home-info-new-mark">NEW</span>
                  )}
                </span>
              </button>

              <button
                type="button"
                className={homeInfoTab === 'announcement' ? 'active' : ''}
                onClick={() => {
                  setHomeInfoTab('announcement')

                  const latestId =
                    ANNOUNCEMENTS.length > 0
                      ? ANNOUNCEMENTS[0].id
                      : ''

                  setLastViewedAnnouncementId(latestId)
                  localStorage.setItem('lastViewedAnnouncementId', latestId)
                }}
              >
                <span className="home-info-tab-label">
                  お知らせ
                  {hasNewAnnouncement && (
                    <span className="home-info-new-mark">NEW</span>
                  )}
                </span>
              </button>
            </div>

            {homeInfoTab === 'patch' && (
              <>
                {PATCH_NOTES.map((note) => (
                  <div className="home-patch-note" key={note.version}>
                    <h3>{note.version}</h3>

                    <p className="home-patch-note-date">
                      {note.date}
                    </p>

                    <ul>
                      {note.changes.map((change) => (
                        <li key={change}>{change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}

            {homeInfoTab === 'announcement' && (
              <>
                {ANNOUNCEMENTS.map((announcement) => (
                  <div className="home-patch-note" key={announcement.id}>
                    <h3>{announcement.title}</h3>

                    <p className="home-patch-note-date">
                      {announcement.date}
                    </p>

                    <ul>
                      {announcement.body.map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}

          </div>
        </div>

      </main>
    </div>
  )
}

export default Home