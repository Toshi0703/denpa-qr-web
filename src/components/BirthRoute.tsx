import Header from './Header'
import '../styles/BirthRoute.css'
import { Link } from 'react-router-dom'

function BirthRoute() {
  return (
    <div className="app">
      <Header />

      <main className="birth-route-page">
        <div className="birth-route-list-page">

          <aside className="birth-route-sidebar">
            <h2>出生ルート</h2>

            <p>
              ここに出生ルートの条件入力欄を作ります。
            </p>
          </aside>

          <section className="birth-route-content">

            <div className="birth-route-pagination">
              <h2>登録済み出生ルート</h2>

              <Link
                to="/birth-route/save"
                className="birth-route-register-button"
              >
                ＋ 新しく出生ルートを登録
              </Link>
            </div>

            <div className="birth-route-list">
              <p>
                ここに登録済みの出生ルートを表示します。
              </p>
            </div>

          </section>

        </div>
      </main>
    </div>
  )
}

export default BirthRoute