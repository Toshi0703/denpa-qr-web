import {
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

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
import type { SearchPageState } from '../types/search'

function Edit({
  denpaList,
  setDenpaList,
}: {
  denpaList: DenpaData[]
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
}) {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const searchPageState =
    location.state?.from === 'search'
      ? (location.state.searchPageState as SearchPageState)
      : null

  const denpa = denpaList.find(
    (item) => item.id === id
  )

  const [name, setName] = useState(denpa?.name ?? '')
  const [evasion, setEvasion] = useState(denpa?.evasion ?? '')
  const [body, setBody] = useState(denpa?.body ?? '')
  const [colorCategory, setColorCategory] = useState(
    denpa?.colorCategory ?? ''
  )
  const [color, setColor] = useState(denpa?.color ?? '')
  const [head, setHead] = useState(denpa?.head ?? '')
  const [antennaCategory, setAntennaCategory] = useState(
    denpa?.antennaCategory ?? ''
  )
  const [antenna, setAntenna] = useState(
    denpa?.antenna ?? ''
  )
  const [feature, setFeature] = useState(
    denpa?.feature ?? ''
  )
  const [qrFile, setQrFile] = useState<File | null>(
    denpa?.qrFile ?? null
  )
  const [bodyTableEvasion, setBodyTableEvasion] = useState(
    denpa?.evasion || EVASION_OPTIONS[0]
  )

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

  if (!denpa) {
    return (
      <div className="app">
        <main className="list-page">
          <h2>データが見つかりません</h2>

          <Link
            to="/search"
            className="back-button"
          >
            検索画面に戻る
          </Link>
        </main>
      </div>
    )
  }

  const handleUpdate = () => {
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
      const shouldUpdate = window.confirm(
        `${unsetItems.join('、')}が設定されていません。\n\n編集しますか？`
      )

      if (!shouldUpdate) {
        return false
      }
    }

    alert('電波人間のデータを編集しました。')

    setDenpaList((currentList) =>
      currentList.map((item) =>
        item.id === denpa.id
          ? {
            ...item,
            name,
            evasion,
            body,
            colorCategory,
            color,
            head,
            antennaCategory,
            antenna,
            feature,
            qrFile,
          }
          : item
      )
    )

    return true
  }

  return (
    <div className="app">
      <Header />

      <main className="save-page">

        <div className="save-layout">

          <div className="save-left">

            {/* QRコード */}
            <div className="save-qr-area">

              <div className="qr-top-area">

                <div className="qr-mode-control">
                  <label htmlFor="edit-qr">
                    QRコード
                  </label>
                </div>

                <div className="qr-input">

                  <input
                    id="edit-qr"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setQrFile(
                        e.target.files?.[0] ?? null
                      )
                    }}
                  />

                  <img
                    className="qr-preview"
                    src={
                      qrFile
                        ? URL.createObjectURL(qrFile)
                        : '/denpa-qr-web/no-image.jpg'
                    }
                    alt={qrFile ? 'QRコード' : 'QRコード未設定'}
                  />

                </div>

              </div>

            </div>

            {/* ステータス */}
            <div className="save-input-area">

              <div className="form">

                <div className="form-row">
                  <label htmlFor="edit-name">
                    名前
                  </label>

                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="edit-evasion">
                    回避率
                  </label>

                  <select
                    id="edit-evasion"
                    value={evasion}
                    onChange={(e) =>
                      setEvasion(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {EVASION_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="edit-body">
                    体格
                  </label>

                  <select
                    id="edit-body"
                    value={body}
                    onChange={(e) =>
                      setBody(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {BODY_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
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
                          setColor(
                            COLOR_OPTIONS[newCategory][0]
                          )
                        }
                      }}
                    >
                      <option value="">
                        選択してください
                      </option>

                      {Object.keys(
                        COLOR_OPTIONS
                      ).map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>

                    <span>＞</span>

                    <select
                      value={color}
                      onChange={(e) =>
                        setColor(e.target.value)
                      }
                      disabled={!colorCategory}
                    >

                      {colorCategory &&
                        COLOR_OPTIONS[colorCategory]?.map((item) => (
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
                  <label htmlFor="edit-head">
                    頭
                  </label>

                  <select
                    id="edit-head"
                    value={head}
                    onChange={(e) =>
                      setHead(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {HEAD_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
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
                          setAntenna(
                            ANTENNA_OPTIONS[newCategory][0]
                          )
                        }
                      }}
                    >
                      <option value="">
                        選択してください
                      </option>

                      {Object.keys(
                        ANTENNA_OPTIONS
                      ).map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
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
                  <label htmlFor="edit-feature">
                    特徴
                  </label>

                  <select
                    id="edit-feature"
                    value={feature}
                    onChange={(e) =>
                      setFeature(e.target.value)
                    }
                  >
                    <option value="">
                      選択してください
                    </option>

                    {FEATURE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
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
                  onClick={() => {
                    const updated = handleUpdate()

                    if (!updated) {
                      return
                    }

                    navigate('/search', {
                      state: searchPageState
                        ? {
                          fromEdit: true,
                          searchPageState,
                        }
                        : undefined,
                    })
                  }}
                >
                  編集して戻る
                </button>

              </div>

            </div>

          </div>

          {/* 体格表 */}
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
                    setBodyTableEvasion(
                      e.target.value
                    )
                  }}
                >
                  {EVASION_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
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
                  BODY_TABLE_DATA[
                    bodyTableEvasion
                  ].map((item, rowIndex) => (

                    <tr key={item.antenna}>

                      <td>
                        {item.category}
                      </td>

                      <td className="body-table-antenna-cell">

                        {item.antenna}

                        {BODY_TABLE_EXCEPTIONS[
                          item.antenna
                        ] && (
                            <span className="body-table-exception-mark">
                              i

                              <span className="body-table-tooltip">

                                {BODY_TABLE_EXCEPTIONS[
                                  item.antenna
                                ]
                                  .split('\n')
                                  .map(
                                    (
                                      text,
                                      index
                                    ) => (
                                      <span
                                        key={index}
                                      >
                                        {index > 0 && (
                                          <br />
                                        )}

                                        {text}
                                      </span>
                                    )
                                  )}

                              </span>
                            </span>
                          )}

                      </td>

                      {item.hp.map(
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

export default Edit