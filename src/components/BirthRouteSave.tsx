import { useState } from 'react'
import Header from './Header'
import '../styles/BirthRouteSave.css'

function BirthRouteSave() {
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
    const [isRegisteredSelectOpen, setIsRegisteredSelectOpen] = useState(false)

    return (
        <div className="app">
            <Header />

            <main className="birth-route-save-page">
                <div className="birth-route-save-layout">

                    {/* 左側：電波人間カード置き場 */}
                    <aside className="birth-route-save-sidebar">
                        <h2>電波人間</h2>

                        <button
                            type="button"
                            className="birth-route-add-card-button"
                            onClick={() => setIsAddCardModalOpen(true)}
                        >
                            ＋ カードを追加
                        </button>

                        <div className="birth-route-card-area">
                            <p>カード置き場</p>
                        </div>
                    </aside>

                    {/* 右側：ワークベンチ */}
                    <section className="birth-route-save-workbench">
                        <h2>ワークベンチ</h2>

                        <div className="birth-route-workbench-area">
                            <p>ここにカードを配置します</p>
                        </div>
                    </section>

                </div>

                {isAddCardModalOpen && (
                    <div
                        className="birth-route-modal-overlay"
                        onClick={() => {
                            setIsAddCardModalOpen(false)
                            setIsRegisteredSelectOpen(false)
                        }}
                    >
                        <div
                            className="birth-route-modal"
                            onClick={(event) => event.stopPropagation()}
                        >

                            {!isRegisteredSelectOpen ? (
                                <>
                                    <h2>電波人間カードを追加</h2>

                                    <button
                                        type="button"
                                        className="birth-route-modal-button"
                                    >
                                        ステータスを入力
                                    </button>

                                    <button
                                        type="button"
                                        className="birth-route-modal-button"
                                        onClick={() => setIsRegisteredSelectOpen(true)}
                                    >
                                        登録済みから選択
                                    </button>

                                    <button
                                        type="button"
                                        className="birth-route-modal-cancel-button"
                                        onClick={() => setIsAddCardModalOpen(false)}
                                    >
                                        キャンセル
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2>登録済みから選択</h2>

                                    <button
                                        type="button"
                                        className="birth-route-modal-button"
                                    >
                                        野生個体から選ぶ
                                    </button>

                                    <button
                                        type="button"
                                        className="birth-route-modal-button"
                                    >
                                        出生個体から選ぶ
                                    </button>

                                    <button
                                        type="button"
                                        className="birth-route-modal-cancel-button"
                                        onClick={() => setIsRegisteredSelectOpen(false)}
                                    >
                                        戻る
                                    </button>
                                </>
                            )}

                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

export default BirthRouteSave