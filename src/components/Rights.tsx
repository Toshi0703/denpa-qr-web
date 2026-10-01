import Header from './Header'
import '../styles/Rights.css'

function Rights() {
    return (
        <div className="app">
            <Header />

            <main className="rights-page">
                <h2>権利・ライセンスについて</h2>

                <section className="rights-section">
                    <h3>1. ゲームに関する権利について</h3>
                    <p>
                        「New 電波人間のRPG FREE!」に関する名称、画像、キャラクター、
                        その他のコンテンツに関する権利は、それぞれの権利者に帰属します。
                    </p>
                    <p>
                        本サイトは「New 電波人間のRPG FREE!」を元にした
                        非公式のファン制作ツールであり、公式・運営元とは一切関係ありません。
                    </p>
                </section>

                <section className="rights-section">
                    <h3>2. 本サイトのソースコードについて</h3>
                    <p>
                        本サイトのソースコードは、制作者が作成したものです。
                    </p>
                    <p>
                        ソースコードの利用、複製、改変、再配布等を行う場合は、
                        GitHub上に掲載されているライセンスや各種案内を確認してください。
                    </p>
                </section>

                <section className="rights-section">
                    <h3>3. 使用しているライブラリ等について</h3>

                    <p>
                        本サイトでは、以下のオープンソースソフトウェアを利用しています。
                    </p>

                    <table className="rights-license-table">
                        <thead>
                            <tr>
                                <th>ソフトウェア</th>
                                <th>ライセンス</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>React</td>
                                <td>MIT License</td>
                            </tr>
                            <tr>
                                <td>React DOM</td>
                                <td>MIT License</td>
                            </tr>
                            <tr>
                                <td>React Router</td>
                                <td>MIT License</td>
                            </tr>
                            <tr>
                                <td>qrcode</td>
                                <td>MIT License</td>
                            </tr>
                            <tr>
                                <td>Vite</td>
                                <td>MIT License</td>
                            </tr>
                            <tr>
                                <td>TypeScript</td>
                                <td>Apache License 2.0</td>
                            </tr>
                        </tbody>
                    </table>

                    <p>
                        上記ソフトウェアには、それぞれのライセンス条件が適用されます。
                    </p>
                </section>

                <section className="rights-section">
                    <h3>4. QRコードについて</h3>
                    <p>
                        本サイトでは、利用者が登録したQRコード画像を
                        ブラウザ上で管理・表示する機能を提供しています。
                    </p>
                    <p>
                        QRコードに含まれる情報や、それによって得られるゲーム内コンテンツに
                        関する権利について、本サイトの制作者が権利を有するものではありません。
                    </p>
                </section>

                <section className="rights-section">
                    <h3>5. 権利関係に関するお問い合わせ</h3>
                    <p>
                        本サイトに掲載されている内容について、権利上の問題等がある場合は、
                        バグ報告・要望フォームからご連絡ください。
                    </p>
                </section>

                <p className="rights-last-updated">
                    最終更新日：2026年10月1日
                </p>
            </main>
        </div>
    )
}

export default Rights