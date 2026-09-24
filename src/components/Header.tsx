import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import HowToUseModal from './HowToUseModal'

function Header() {
  const location = useLocation()

  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false)

  let breadcrumb = ''

  if (location.pathname === '/save') {
    breadcrumb += ' ＞ 電波人間を登録'
  } else if (location.pathname === '/search') {
    breadcrumb += ' ＞ 電波人間を検索'
  } else if (location.pathname.startsWith('/edit/')) {
    breadcrumb += ' ＞ 電波人間を検索 ＞ データ編集'
  } else if (location.pathname === '/qr-history') {
    breadcrumb += ' ＞ 電波人間を登録 ＞ QRコード生成履歴（直近300個）'
  }

  return (
    <>
      <header className="site-header">
        <Link to="/" className="site-title">
          電波人間 QRコード管理ツール
        </Link>

        <div className="header-breadcrumb">
          {breadcrumb}
        </div>

        <nav className="site-nav">
          <Link to="/">ホーム</Link>
          <Link to="/save">登録</Link>
          <Link to="/search">検索</Link>

          <button
            type="button"
            className="site-nav-button"
            onClick={() => setIsHowToUseOpen(true)}
          >
            使い方
          </button>
        </nav>
      </header>

      {isHowToUseOpen && (
        <HowToUseModal
          onClose={() => setIsHowToUseOpen(false)}
        />
      )}
    </>
  )
}

export default Header