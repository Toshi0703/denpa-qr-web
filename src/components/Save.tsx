import {
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import QRCode from 'qrcode'

import Header from './Header'

import {
  ANTENNA_OPTIONS,
  BODY_OPTIONS,
  BODY_TABLE_DATA,
  BODY_TABLE_EXCEPTIONS,
  COLOR_OPTIONS,
  EVASION_OPTIONS,
  FEATURE_OPTIONS,
  HEAD_OPTIONS,
} from '../data/options'

import type { DenpaData } from '../types/denpa'
import type { QrHistory } from '../types/qr'

const generateRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    )

    result += characters[randomIndex]
  }

  return result
}

function Save({
  setDenpaList,
  setQrHistory,
}: {
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
  setQrHistory: Dispatch<SetStateAction<QrHistory[]>>
}) {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [evasion, setEvasion] = useState('')
  const [body, setBody] = useState('')
  const [colorCategory, setColorCategory] = useState('')
  const [color, setColor] = useState('')
  const [head, setHead] = useState('')
  const [antennaCategory, setAntennaCategory] = useState('')
  const [antenna, setAntenna] = useState('')
  const [feature, setFeature] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const location = useLocation()

  const [qrMode, setQrMode] =
    useState<'select' | 'generate'>(
      location.state?.qrMode ?? 'select'
    )

  const [generatedQr, setGeneratedQr] = useState<string | null>(null)
  const [qrLength, setQrLength] = useState(100)
  const [qrDecided, setQrDecided] = useState(false)
  const [qrGenerationCount, setQrGenerationCount] = useState(0)
  const [bodyTableEvasion, setBodyTableEvasion] = useState('0')
  const [hoveredCell, setHoveredCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const BODY_TYPES = ['最大', '準大', '中間', '準速', '最速']

  const handleBodyTableClick = (
    antenna: string,
    bodyType: string
  ) => {
    setEvasion(bodyTableEvasion)
    setBody(bodyType)

    if (antenna === 'アンテナなし') {
      setAntennaCategory('アンテナなし')
      setAntenna('アンテナなし')
    } else if (antenna === '単体属性攻撃') {
      setAntennaCategory('攻撃（火）')
      setAntenna('ひのたま')
    } else if (antenna === '３体属性攻撃') {
      setAntennaCategory('攻撃（火）')
      setAntenna('ばくはつ')
    } else if (antenna === 'ノックダウン') {
      setAntennaCategory('攻撃（その他）')
      setAntenna('ノックダウン')
    } else if (antenna === 'ちょっとかいふく') {
      setAntennaCategory('回復')
      setAntenna('ちょっとかいふく')
    } else if (antenna === 'ちょっとふっかつ') {
      setAntennaCategory('治療')
      setAntenna('ちょっとふっかつ')
    } else if (antenna === 'ぜんぶなおす') {
      setAntennaCategory('治療')
      setAntenna('ぜんぶなおす')
    } else if (antenna === 'げどく') {
      setAntennaCategory('治療')
      setAntenna('げどく')
    } else if (antenna === 'しびれとる') {
      setAntennaCategory('治療')
      setAntenna('しびれとる')
    } else if (antenna === 'めざめる') {
      setAntennaCategory('治療')
      setAntenna('めざめる')
    } else if (antenna === 'ぞくせいなおす') {
      setAntennaCategory('治療')
      setAntenna('ぞくせいなおす')
    } else if (antenna === 'すこしこうふん') {
      setAntennaCategory('増強')
      setAntenna('すこしこうふん')
    } else if (antenna === 'すこしむてき') {
      setAntennaCategory('増強')
      setAntenna('すこしむてき')
    } else if (antenna === 'たくわえる') {
      setAntennaCategory('増強')
      setAntenna('たくわえる')
    } else if (antenna === 'その他単体増強系') {
      setAntennaCategory('増強')
      setAntenna('すこしはやくなれ')
    } else if (antenna === '補助系') {
      setAntennaCategory('補助')
      setAntenna('すこしねむらせる')
    } else if (antenna === 'ちょっとあしもとガード') {
      setAntennaCategory('お得')
      setAntenna('ちょっとあしもとガード')
    }
  }


  const handleSave = () => {
    const unsetItems: string[] = []

    if (!name) {
      unsetItems.push('名前')
    }

    if (!evasion) {
      unsetItems.push('回避率')
    }

    if (!body) {
      unsetItems.push('体格')
    }

    if (!colorCategory || !color) {
      unsetItems.push('色')
    }

    if (!head) {
      unsetItems.push('頭')
    }

    if (!antennaCategory || !antenna) {
      unsetItems.push('アンテナ')
    }

    if (!feature) {
      unsetItems.push('特徴')
    }

    if (!qrFile) {
      unsetItems.push('QRコード')
    }

    if (unsetItems.length > 0) {
      const shouldSave = window.confirm(
        `${unsetItems.join('、')}が設定されていません。\n\n保存しますか？`
      )

      if (!shouldSave) {
        return
      }
    }

    const denpaData: DenpaData = {
      id: crypto.randomUUID(),
      name,
      evasion,
      body,
      colorCategory,
      color,
      head,
      antennaCategory,
      antenna,
      feature,
      capture: false,
      favorite: false,
      createdAt: Date.now(),
      qrFile,
    }

    setDenpaList((currentList) => [
      ...currentList,
      denpaData,
    ])

    console.log('登録する電波人間データ')
    console.log(denpaData)

    alert('新しい電波人間のデータを登録しました。')

    setName('')
    setEvasion('')
    setBody('')
    setColorCategory('')
    setColor('')
    setHead('')
    setAntennaCategory('')
    setAntenna('')
    setFeature('')
  }



  return (
    <div className="app">

      <Header />

      <main className="save-page">

        <div className="save-layout">
          <div className="save-left">
            <div className="save-qr-area">
              <div className="qr-top-area">
                <div className="qr-mode-control">
                  <label htmlFor="qr-mode">QRコード</label>

                  <select
                    id="qr-mode"
                    value={qrMode}
                    onChange={(e) => {
                      const newMode = e.target.value as 'select' | 'generate'

                      setQrFile(null)
                      setGeneratedQr(null)
                      setQrDecided(false)

                      setQrMode(newMode)
                    }}
                  >
                    <option value="select">選択モード</option>
                    <option value="generate">生成モード</option>
                  </select>
                </div>

                {qrMode === 'select' && (
                  <div className="qr-input">
                    <input
                      id="qr"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setQrFile(e.target.files?.[0] ?? null)
                      }}
                    />

                    {qrFile && (
                      <img
                        className="qr-preview"
                        src={URL.createObjectURL(qrFile)}
                        alt="選択したQRコード"
                      />
                    )}
                  </div>
                )}
              </div>

              {qrMode === 'generate' && (
                <div className="qr-generate-area">

                  <div className="qr-length-control">
                    <label htmlFor="qr-length">
                      情報量：
                    </label>

                    <select
                      id="qr-length"
                      value={qrLength}
                      onChange={(e) => {
                        setQrLength(Number(e.target.value))
                      }}
                    >
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                      <option value={400}>400</option>
                      <option value={500}>500</option>
                    </select>
                  </div>

                  <div className="qr-generate-buttons">
                    <button
                      onClick={async () => {
                        const qrData = generateRandomString(qrLength)
                        const qrImage = await QRCode.toDataURL(qrData)
                        setQrGenerationCount((count) => count + 1)

                        const newHistory: QrHistory = {
                          id: crypto.randomUUID(),
                          qrData: qrImage,
                          createdAt: Date.now(),
                        }

                        setQrHistory((currentHistory) => [
                          newHistory,
                          ...currentHistory,
                        ].slice(0, 300))

                        setGeneratedQr(qrImage)
                        setQrDecided(false)
                      }}
                      disabled={qrDecided}
                    >
                      QRコードを生成
                    </button>

                    <button
                      onClick={async () => {
                        if (qrDecided) {
                          setQrFile(null)
                          setQrDecided(false)
                          return
                        }

                        if (!generatedQr) {
                          return
                        }

                        const [, base64] = generatedQr.split(',')

                        const binary = atob(base64)
                        const bytes = new Uint8Array(binary.length)

                        for (let i = 0; i < binary.length; i++) {
                          bytes[i] = binary.charCodeAt(i)
                        }

                        const file = new File(
                          [bytes],
                          `generated-${Date.now()}.png`,
                          { type: 'image/png' }
                        )

                        setQrFile(file)
                        setQrDecided(true)
                      }}
                      disabled={!generatedQr}
                    >
                      {qrDecided
                        ? '決定を解除'
                        : 'このQRコードで決定'}
                    </button>

                    <button
                      onClick={() =>
                        navigate('/qr-history', {
                          state: {
                            qrMode,
                          },
                        })
                      }
                    >
                      履歴（直近300個）
                    </button>
                  </div>

                  {generatedQr && (
                    <div className="qr-generated-preview">
                      <p className="qr-generation-count">
                        生成回数：{qrGenerationCount}回
                      </p>

                      <img
                        className="qr-preview qr-generated-image"
                        src={generatedQr}
                        alt="生成したQRコード"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="save-input-area">

              <div className="form">
                <div className="form-row">
                  <label htmlFor="name">名前</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="evasion">回避率</label>

                  <select
                    id="evasion"
                    value={evasion}
                    onChange={(e) => setEvasion(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {EVASION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="body">体格</label>

                  <select
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {BODY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>色</label>

                  <div className="select-group">
                    <select
                      value={colorCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value
                        setColorCategory(newCategory)
                        if (newCategory === '') {
                          setColor('')
                        } else {
                          setColor(COLOR_OPTIONS[newCategory][0])
                        }
                      }}
                    >
                      <option value="">選択してください</option>

                      {Object.keys(COLOR_OPTIONS).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      disabled={!colorCategory}
                    >
                      {colorCategory &&
                        COLOR_OPTIONS[colorCategory].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="evasion">頭</label>

                  <select
                    id="head"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {HEAD_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>アンテナ</label>

                  <div className="select-group">
                    <select
                      value={antennaCategory}
                      onChange={(e) => {
                        const newCategory = e.target.value
                        setAntennaCategory(newCategory)
                        if (newCategory === '') {
                          setAntenna('')
                        } else {
                          setAntenna(ANTENNA_OPTIONS[newCategory][0])
                        }
                      }}
                    >
                      <option value="">選択してください</option>

                      {Object.keys(ANTENNA_OPTIONS).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={antenna}
                      onChange={(e) =>
                        setAntenna(e.target.value)
                      }
                      disabled={!antennaCategory}
                    >

                      {antennaCategory &&
                        ANTENNA_OPTIONS[
                          antennaCategory
                        ].map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="evasion">特徴</label>

                  <select
                    id="feature"
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                  >
                    <option value="">選択してください</option>

                    {FEATURE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                >
                  登録する
                </button>
              </div>

            </div>

          </div>

          <div className="save-body-table">
            <div className="body-table-header">
              <h3>レベル１体格表（数値はHP）</h3>

              <div className="body-table-evasion">
                <label htmlFor="body-table-evasion">
                  回避率
                </label>

                <select
                  id="body-table-evasion"
                  value={bodyTableEvasion}
                  onChange={(e) => {
                    setBodyTableEvasion(e.target.value)
                  }}
                >
                  {EVASION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="body-table">
              <thead>
                <tr>
                  <th>カテゴリー</th>
                  <th>アンテナ</th>
                  <th>最大</th>
                  <th>準大</th>
                  <th>中間</th>
                  <th>準速</th>
                  <th>最速</th>
                </tr>
              </thead>

              <tbody>
                {BODY_TABLE_DATA[bodyTableEvasion] ? (
                  BODY_TABLE_DATA[bodyTableEvasion].map((item, rowIndex) => (
                    <tr key={item.antenna}>
                      <td>{item.category}</td>
                      <td className="body-table-antenna-cell">
                        {item.antenna}

                        {BODY_TABLE_EXCEPTIONS[item.antenna] && (
                          <span className="body-table-exception-mark">
                            i
                            <span className="body-table-tooltip">
                              {BODY_TABLE_EXCEPTIONS[item.antenna]
                                .split('\n')
                                .map((text, index) => (
                                  <span key={index}>
                                    {index > 0 && <br />}
                                    {text}
                                  </span>
                                ))}
                            </span>
                          </span>
                        )}
                      </td>

                      {Array.isArray(item.hp) &&
                        item.hp.map(
                          (value, index) => (

                            <td
                              key={index}
                              className={
                                hoveredCell?.row ===
                                  rowIndex &&
                                  hoveredCell?.col ===
                                  index
                                  ? 'body-table-cell-hover'
                                  : hoveredCell?.row ===
                                    rowIndex ||
                                    hoveredCell?.col ===
                                    index
                                    ? 'body-table-line-hover'
                                    : ''
                              }
                              onMouseEnter={() => {
                                setHoveredCell({
                                  row: rowIndex,
                                  col: index,
                                })
                              }}
                              onMouseLeave={() => {
                                setHoveredCell(null)
                              }}
                              onClick={() => {
                                handleBodyTableClick(
                                  item.antenna,
                                  BODY_TYPES[index]
                                )
                              }}
                            >
                              {value}
                            </td>

                          )
                        )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      この回避率のデータは未登録です。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Save