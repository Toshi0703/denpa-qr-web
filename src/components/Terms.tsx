import Header from './Header'
import '../styles/Terms.css'

function Terms() {
  return (
    <div className="app">
      <Header />

      <main className="terms-page">
        <h2>利用規約</h2>

        <section className="terms-section">
          <h3>第1条（本サイトについて）</h3>
          <p>
            本サイト「電波人間 QRコード管理ツール」は、
            「New 電波人間のRPG FREE!」を元にした非公式のファン制作ツールです。
          </p>
          <p>
            本サイトは、ゲーム公式・運営元とは一切関係ありません。
          </p>
        </section>

        <section className="terms-section">
          <h3>第2条（利用について）</h3>
          <p>
            利用者は、本サイトを自己の責任において利用するものとします。
          </p>
          <p>
            本サイトの利用によって利用者に生じた損害について、
            制作者は責任を負いません。
          </p>
        </section>

        <section className="terms-section">
          <h3>第3条（登録データについて）</h3>
          <p>
            本サイトに登録された電波人間の情報やその他のデータは、
            原則として利用者のブラウザ上に保存されます。
          </p>
          <p>
            制作者は、利用者が登録したデータの消失や破損について
            保証するものではありません。
          </p>
          <p>
            必要に応じて、バックアップ機能を利用してデータを保存してください。
          </p>
        </section>

        <section className="terms-section">
          <h3>第4条（禁止事項）</h3>
          <p>利用者は、以下の行為を行ってはならないものとします。</p>
          <ul>
            <li>本サイトへの不正アクセスを行う行為</li>
            <li>本サイトやサーバー等に過度な負荷をかける行為</li>
            <li>他の利用者や第三者に迷惑をかける行為</li>
            <li>本サイトの運営を妨害する行為</li>
            <li>その他、制作者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="terms-section">
          <h3>第5条（サービスの変更・停止）</h3>
          <p>
            制作者は、利用者への事前の通知なく、本サイトの内容や機能を
            変更、追加、削除、停止または終了する場合があります。
          </p>
        </section>

        <section className="terms-section">
          <h3>第6条（利用規約の変更）</h3>
          <p>
            制作者は、必要に応じて本利用規約を変更することがあります。
          </p>
          <p>
            変更後の利用規約は、本サイト上に掲載した時点から適用されます。
          </p>
        </section>

        <p className="terms-last-updated">
          最終更新日：2026年10月1日
        </p>
      </main>
    </div>
  )
}

export default Terms