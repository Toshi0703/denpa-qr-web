import Header from './Header'
import '../styles/BirthRoute.css'

function BirthRoute() {
  return (
    <div className="app">
      <Header />

      <main className="birth-route-page">
        <h2>出生ルート</h2>

        <div className="birth-route-header">
          <p>登録済みの出生ルート</p>

          <button type="button">
            ＋ 新しく登録
          </button>
        </div>

        <div className="birth-route-empty">
          <p>登録されている出生ルートはありません。</p>
        </div>
      </main>
    </div>
  )
}

export default BirthRoute