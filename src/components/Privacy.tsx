import Header from './Header'
import '../styles/Privacy.css'

function Privacy() {
  return (
    <div className="app">
      <Header />

      <main className="privacy-page">
        <h2>プライバシーポリシー</h2>

        <section className="privacy-section">
          <h3>1. 個人情報について</h3>
          <p>
            本サイト「電波人間 QRコード管理ツール」では、
            本サイトの利用にあたって、利用者の個人情報を原則として収集していません。
          </p>
        </section>

        <section className="privacy-section">
          <h3>2. 本サイト内のデータ保存について</h3>
          <p>
            本サイトで登録した電波人間の情報やその他のデータは、
            原則として利用者のブラウザ内に保存されます。
          </p>
          <p>
            制作者が通常のサイト利用を通じて、
            利用者の登録データを直接取得することはありません。
          </p>
        </section>

        <section className="privacy-section">
          <h3>3. バグ報告・要望フォームについて</h3>
          <p>
            バグ報告・要望フォームでは、利用者が入力した内容を
            Google Formsを通じて受け付けています。
          </p>
          <p>
            メールアドレスを入力した場合、その情報は問い合わせへの
            返信などの目的で利用することがあります。
          </p>
          <p>
            フォームに入力された情報は、フォームの提供元である
            Googleのサービス上で取り扱われます。
          </p>
        </section>

        <section className="privacy-section">
          <h3>4. Google Formsについて</h3>
          <p>
            バグ報告・要望フォームの利用に関しては、
            Googleのプライバシーポリシー等も適用されます。
          </p>
        </section>

        <section className="privacy-section">
          <h3>5. アクセス解析等について</h3>
          <p>
            本サイトでは、利用者の行動を追跡する目的で
            Google Analytics等のアクセス解析サービスを使用していません。
          </p>
        </section>

        <section className="privacy-section">
          <h3>6. プライバシーポリシーの変更</h3>
          <p>
            本サイトの機能追加や運用方法の変更等に伴い、
            本プライバシーポリシーを変更する場合があります。
          </p>
          <p>
            変更後のプライバシーポリシーは、本サイト上に掲載した時点から適用されます。
          </p>
        </section>

        <p className="privacy-last-updated">
          最終更新日：2026年10月1日
        </p>
      </main>
    </div>
  )
}

export default Privacy