import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import type { QrHistory } from '../types/qr'

function QrHistoryPage({
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

      <Header />

      <div className="qr-history-header">
        <button
          type="button"
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

        <span className="qr-history-page-number">
          {page} / {totalPages || 1}
        </span>
      </div>

      <div className="qr-history-card-area">

        <button
          type="button"
          className="qr-history-pagination-button qr-history-pagination-prev"
          onClick={() => setPage((currentPage) => currentPage - 1)}
          disabled={page === 1}
          aria-label="前のページ"
        >
          ＜
        </button>

        <div className="qr-history-grid">
          {currentHistory.map((item) => (
            <div
              key={item.id}
              className="qr-history-item"
            >
              <div className="qr-history-item-info">
                <p>
                  {new Date(item.createdAt).toLocaleString('ja-JP')}
                </p>

                <button
                  type="button"
                  className="qr-history-download-button"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = item.qrData
                    link.download = `qr-${item.id}.png`
                    link.click()
                  }}
                  aria-label="画像を保存"
                  title="画像を保存"
                >
                  <span className="download-icon">
                    <span className="download-arrow"></span>
                    <span className="download-line"></span>
                  </span>
                </button>

              </div>

              <img
                src={item.qrData}
                alt="生成したQRコード"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="qr-history-pagination-button qr-history-pagination-next"
          onClick={() => setPage((currentPage) => currentPage + 1)}
          disabled={page === totalPages || totalPages === 0}
          aria-label="次のページ"
        >
          ＞
        </button>

      </div>
    </div>
  )
}

export default QrHistoryPage