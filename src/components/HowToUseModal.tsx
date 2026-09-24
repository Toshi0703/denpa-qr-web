import { useState } from 'react'

function HowToUseModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<
    'register' | 'search' | 'data'
  >('register')

  return (
    <div className="how-to-use-overlay" onClick={onClose}>
      <div
        className="how-to-use-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="how-to-use-header">
          <h2>このツールの使い方</h2>

          <button
            type="button"
            className="how-to-use-close-button"
            onClick={onClose}
            aria-label="使い方を閉じる"
          >
            ×
          </button>
        </div>

        <div className="how-to-use-tabs">
          <button
            type="button"
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => setActiveTab('register')}
          >
            電波人間を登録
          </button>

          <button
            type="button"
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            電波人間を検索
          </button>

          <button
            type="button"
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            データ管理
          </button>
        </div>

        <div className="how-to-use-content">
          {activeTab === 'register' && (
            <section className="how-to-use-section">
              <h3>電波人間を登録</h3>

              <h4>画面左上：QRコード</h4>

              <h5>1. 選択モード</h5>
              <p>
                「ファイルを選択」を押して、登録するQRコードの画像ファイルを選択します。
              </p>

              <h5>2. 生成モード</h5>
              <p>
                「QRコードを生成」を押すと、設定した情報量に応じたQRコードを生成します。
                登録したい電波人間が出現するQRコードを見つけたら、
                「このQRコードで決定」を押してステータスを入力します。
              </p>

              <p>
                「履歴（直近300個）」を押すと、これまでに生成したQRコードのうち
                直近300個を閲覧・保存できます。
              </p>

              <p className="how-to-use-note">
                ※「QRコード」の下にあるプルダウンから、
                選択モードと生成モードを切り替えられます。
              </p>

              <h4>画面左下：ステータス</h4>

              <p>
                登録する電波人間のステータスを入力します。
              </p>

              <p>
                「色」と「アンテナ」は、まずジャンルを選択してから、
                色・アンテナの名前を選択してください。
              </p>

              <p>
                すべての入力が完了したら、「登録する」を押してください。
              </p>

              <h4>画面右：体格表</h4>

              <p>
                電波人間の体格表を確認できます。
                右上のプルダウンから、確認したい回避率の体格表を選択できます。
                表の数値を選択すると、対応する回避率、体格、アンテナが自動で入力されます。
                （一部アンテナは手動で変更する必要あり）
              </p>
            </section>
          )}

          {activeTab === 'search' && (
            <section className="how-to-use-section">
              <h3>電波人間を検索</h3>

              <h4>画面左：検索条件</h4>

              <p>
                電波人間の検索条件を指定できます。
              </p>

              <p>
                「色」と「アンテナ」は、ジャンルだけを指定して検索することもできます。
              </p>

              <p>
                条件を指定すると、必須項目と任意項目を切り替えるボタンが表示されます。<br></br>
                ・ボタンが「必須」（青文字）の場合、検索結果にはその項目を含む電波人間のみが表示されます。<br></br>
                ・ボタンが「任意」（黄文字）の場合、検索結果には任意項目に指定した項目を、設定した個数以上含むもののみが表示されます
                （任意項目の最低一致数は左下の「任意項目：〇個以上一致」というプルダウンから設定できます）。
              </p>

              <p>
                「検索条件をクリア」を押すと、すべての検索条件を「指定なし」に戻せます。
              </p>

              <p>
                現在の検索条件を保存したい場合は、
                「現在の検索条件を登録する」を押して登録名を入力してください。
              </p>

              <p>
                登録した検索条件は、
                「登録した検索条件を使う」→使用したい検索条件の登録名
                →「この検索条件を使う」の順に操作することで呼び出せます。
              </p>

              <h4>画面右上：検索結果の操作</h4>

              <p>
                指定した検索条件を満たす電波人間の件数と、
                現在表示しているページ／最後尾のページが表示されます。
              </p>

              <p>
                また、表示件数や並び順を変更したり、
                捕獲済み／未捕獲、お気に入り／お気に入りでない
                などの絞り込みを行ったりできます。
              </p>

              <h4>画面右下：検索結果</h4>

              <p>
                検索条件を満たす電波人間のステータスとQRコードが表示されます。
              </p>

              <h5>★ボタン</h5>

              <p>
                名前の左にある「★」を押すと、
                お気に入り登録／お気に入り解除ができます。
              </p>

              <h5>QRコード</h5>

              <p>
                QRコードを押すと、捕獲済み／未捕獲を切り替えられます。
              </p>

              <h5>UUID・画像拡大</h5>

              <p>
                QRコードの上にはUUIDが表示されます。
                右側のボタンからUUIDをコピーできます。
                また、画像拡大ボタンからQRコードを大きく表示できます。
              </p>

              <h5>編集・削除</h5>

              <p>
                QRコードの下にある「編集」ボタンから、
                登録した電波人間のデータを編集できます。
              </p>

              <p>
                編集画面では、ステータスやQRコードを変更できます。
              </p>

              <p className="how-to-use-note">
                ※編集時は生成モードのQRコードは使用できません。
              </p>

              <p>
                「削除」ボタンを押すと、その電波人間のデータを削除できます。
              </p>

              <h5>ページ移動</h5>

              <p>
                左右の「＜」「＞」ボタンを押すと、ページを移動できます。
              </p>
            </section>
          )}

          {activeTab === 'data' && (
            <section className="how-to-use-section">
              <h3>データ管理</h3>

              <h4>データの保存について</h4>

              <p>
                登録した電波人間のデータは、お使いのブラウザ内に保存されます。
              </p>

              <p>
                同じブラウザ・同じ端末で利用する限り、
                ページを閉じても登録したデータは保持されます。
              </p>

              <p className="how-to-use-note">
                ※ブラウザのデータを削除した場合や、別の端末・ブラウザを使用した場合は、
                登録したデータが表示されないことがあります。
              </p>

              <h4>バックアップ</h4>

              <p>
                「バックアップ」を押すと、登録した電波人間のデータを
                バックアップファイルとして保存できます。
              </p>

              <p>
                大切なデータを失わないよう、定期的にバックアップを作成することをおすすめします。
              </p>

              <h4>復元</h4>

              <p>
                バックアップファイルを使用して、保存したデータを復元できます。
              </p>

              <p>
                「ファイルを選択」からバックアップファイルを選択し、
                「復元」を押してください。
              </p>

              <p className="how-to-use-note">
                ※復元を行うと、現在保存されているデータがバックアップファイルの内容に置き換わります。
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default HowToUseModal