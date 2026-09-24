import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'

import {
  useNavigate,
  useLocation,
} from 'react-router-dom'

import Header from './Header'

import {
  ANTENNA_OPTIONS,
  BODY_OPTIONS,
  COLOR_OPTIONS,
  EVASION_OPTIONS,
  FEATURE_OPTIONS,
  HEAD_OPTIONS,
} from '../data/options'

import type {
  SearchCondition,
  SearchMatch,
  SearchPageState,
} from '../types/search'

type DenpaData = {
  id: string
  name: string
  evasion: string
  body: string
  colorCategory: string
  color: string
  head: string
  antennaCategory: string
  antenna: string
  feature: string
  capture: boolean
  favorite: boolean
  createdAt: number
  qrFile: File | null
}

function Search({
  denpaList,
  setDenpaList,
  searchConditions,
  setSearchConditions,
}: {
  denpaList: DenpaData[]
  setDenpaList: Dispatch<SetStateAction<DenpaData[]>>
  searchConditions: SearchCondition[]
  setSearchConditions: Dispatch<SetStateAction<SearchCondition[]>>
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const handleDelete = (id: string) => {
    const target = denpaList.find(
      (denpa) => denpa.id === id
    )

    if (!target) {
      return
    }

    const confirmed = window.confirm(
      `「${target.name || '名前未設定'}」を削除しますか？`
    )

    if (!confirmed) {
      return
    }

    setDenpaList((currentList) =>
      currentList.filter(
        (denpa) => denpa.id !== id
      )
    )
  }

  const [uuid, setUuid] = useState('')
  const [name, setName] = useState('')
  const [evasion, setEvasion] = useState('')
  const [body, setBody] = useState('')
  const [colorCategory, setColorCategory] = useState('')
  const [color, setColor] = useState('')
  const [head, setHead] = useState('')
  const [antennaCategory, setAntennaCategory] = useState('')
  const [antenna, setAntenna] = useState('')
  const [feature, setFeature] = useState('')
  const [captureSearch, setCaptureSearch] = useState('')
  const [favoriteSearch, setFavoriteSearch] = useState('')
  const [sortMode, setSortMode] = useState<'new' | 'old' | 'name'>('new')
  const [currentPage, setCurrentPage] = useState(() => {
    if (location.state?.fromEdit === true) {
      const restoredState =
        location.state.searchPageState as SearchPageState

      return restoredState.currentPage
    }

    return 1
  })
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [conditionMode, setConditionMode] = useState<
    'none' | 'register' | 'load'
  >('none')
  const [conditionName, setConditionName] = useState('')
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null)
  const [editingConditionName, setEditingConditionName] = useState('')
  const [conditionSort, setConditionSort] = useState<
    'new' | 'old' | 'name'
  >('new')


  const [nameRequired, setNameRequired] = useState(true)
  const [evasionRequired, setEvasionRequired] = useState(true)
  const [bodyRequired, setBodyRequired] = useState(true)
  const [colorRequired, setColorRequired] = useState(true)
  const [headRequired, setHeadRequired] = useState(true)
  const [antennaRequired, setAntennaRequired] = useState(true)
  const [featureRequired, setFeatureRequired] = useState(true)

  const [optionalMin, setOptionalMin] = useState(0)

  const [expandedQr, setExpandedQr] = useState<DenpaData | null>(null)

  useEffect(() => {
    if (!expandedQr) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedQr(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedQr])

  useEffect(() => {
    if (location.state?.fromEdit !== true) {
      return
    }

    const restoredState =
      location.state.searchPageState as SearchPageState

    setUuid(restoredState.uuid)
    setName(restoredState.name)
    setEvasion(restoredState.evasion)
    setBody(restoredState.body)
    setColorCategory(restoredState.colorCategory)
    setColor(restoredState.color)
    setHead(restoredState.head)
    setAntennaCategory(restoredState.antennaCategory)
    setAntenna(restoredState.antenna)
    setFeature(restoredState.feature)
    setCaptureSearch(restoredState.captureSearch)
    setFavoriteSearch(restoredState.favoriteSearch)

    setNameRequired(restoredState.nameRequired)
    setEvasionRequired(restoredState.evasionRequired)
    setBodyRequired(restoredState.bodyRequired)
    setColorRequired(restoredState.colorRequired)
    setHeadRequired(restoredState.headRequired)
    setAntennaRequired(restoredState.antennaRequired)
    setFeatureRequired(restoredState.featureRequired)

    setOptionalMin(restoredState.optionalMin)
    setItemsPerPage(restoredState.itemsPerPage)
    setSortMode(restoredState.sortMode)
    setCurrentPage(restoredState.currentPage)
  }, [location.state])

  useEffect(() => {
  }, [currentPage])

  const optionalConditionCount =
    (name !== '' && !nameRequired ? 1 : 0) +
    (evasion !== '' && !evasionRequired ? 1 : 0) +
    (body !== '' && !bodyRequired ? 1 : 0) +
    (
      (colorCategory !== '' || color !== '') &&
        !colorRequired
        ? 1
        : 0
    ) +
    (head !== '' && !headRequired ? 1 : 0) +
    (
      (antennaCategory !== '' || antenna !== '') &&
        !antennaRequired
        ? 1
        : 0
    ) +
    (feature !== '' && !featureRequired ? 1 : 0)

  useEffect(() => {
    setOptionalMin((currentMin) =>
      Math.min(currentMin, optionalConditionCount)
    )
  }, [optionalConditionCount])

  const searchResults = denpaList
    .map((denpa) => {

      if (uuid !== '') {
        if (denpa.id === uuid) {
          return {
            denpa,
            match: {
              required: [],
              optional: [],
            },
          }
        }

        return null
      }

      const requiredMatches: string[] = []
      const optionalMatches: string[] = []

      // ========================================
      // 検索条件が指定されているか
      // ========================================

      const nameSpecified = name !== ''
      const evasionSpecified = evasion !== ''
      const bodySpecified = body !== ''
      const colorCategorySpecified = colorCategory !== ''
      const colorSpecified = color !== ''
      const headSpecified = head !== ''
      const antennaCategorySpecified = antennaCategory !== ''
      const antennaSpecified = antenna !== ''
      const featureSpecified = feature !== ''

      // ========================================
      // 色の一致判定
      // ========================================

      let colorMatches = false

      if (colorSpecified) {
        // 色まで指定されている場合
        colorMatches = denpa.color === color
      } else if (colorCategorySpecified) {
        // 色カテゴリだけ指定されている場合
        colorMatches =
          COLOR_OPTIONS[colorCategory]?.includes(
            denpa.color
          ) ?? false
      }

      // ========================================
      // アンテナの一致判定
      // ========================================

      let antennaMatches = false

      if (antennaSpecified) {
        // アンテナまで指定されている場合
        antennaMatches =
          denpa.antenna === antenna
      } else if (antennaCategorySpecified) {
        // アンテナカテゴリだけ指定されている場合
        antennaMatches =
          ANTENNA_OPTIONS[antennaCategory]?.includes(
            denpa.antenna
          ) ?? false
      }

      // ========================================
      // 必須条件
      // ========================================

      if (nameSpecified && nameRequired) {
        if (
          denpa.name
            .toLowerCase()
            .includes(name.toLowerCase())
        ) {
          requiredMatches.push('名前')
        } else {
          return null
        }
      }

      if (evasionSpecified && evasionRequired) {
        if (denpa.evasion === evasion) {
          requiredMatches.push('回避率')
        } else {
          return null
        }
      }

      if (bodySpecified && bodyRequired) {
        if (denpa.body === body) {
          requiredMatches.push('体格')
        } else {
          return null
        }
      }

      if (
        (colorCategorySpecified || colorSpecified) &&
        colorRequired
      ) {
        if (colorMatches) {
          requiredMatches.push('色')
        } else {
          return null
        }
      }

      if (headSpecified && headRequired) {
        if (denpa.head === head) {
          requiredMatches.push('頭')
        } else {
          return null
        }
      }

      if (
        (antennaCategorySpecified ||
          antennaSpecified) &&
        antennaRequired
      ) {
        if (antennaMatches) {
          requiredMatches.push('アンテナ')
        } else {
          return null
        }
      }

      if (featureSpecified && featureRequired) {
        if (denpa.feature === feature) {
          requiredMatches.push('特徴')
        } else {
          return null
        }
      }



      // ========================================
      // 任意条件
      // ========================================

      if (nameSpecified && !nameRequired) {
        if (
          denpa.name
            .toLowerCase()
            .includes(name.toLowerCase())
        ) {
          optionalMatches.push('名前')
        }
      }

      if (
        evasionSpecified &&
        !evasionRequired
      ) {
        if (denpa.evasion === evasion) {
          optionalMatches.push('回避率')
        }
      }

      if (bodySpecified && !bodyRequired) {
        if (denpa.body === body) {
          optionalMatches.push('体格')
        }
      }

      if (
        (colorCategorySpecified ||
          colorSpecified) &&
        !colorRequired
      ) {
        if (colorMatches) {
          optionalMatches.push('色')
        }
      }

      if (headSpecified && !headRequired) {
        if (denpa.head === head) {
          optionalMatches.push('頭')
        }
      }

      if (
        (antennaCategorySpecified ||
          antennaSpecified) &&
        !antennaRequired
      ) {
        if (antennaMatches) {
          optionalMatches.push('アンテナ')
        }
      }

      if (
        featureSpecified &&
        !featureRequired
      ) {
        if (denpa.feature === feature) {
          optionalMatches.push('特徴')
        }
      }

      if (captureSearch !== '') {
        if (String(denpa.capture) !== captureSearch) {
          return null
        }
      }

      if (favoriteSearch !== '') {
        if (String(denpa.favorite) !== favoriteSearch) {
          return null
        }
      }

      // ========================================
      // 任意条件の最低一致数を確認
      // ========================================

      if (
        optionalConditionCount > 0 &&
        optionalMatches.length < optionalMin
      ) {
        return null
      }

      return {
        denpa,
        match: {
          required: requiredMatches,
          optional: optionalMatches,
        },
      }
    })
    .filter(
      (
        result
      ): result is {
        denpa: DenpaData
        match: SearchMatch
      } => result !== null
    )

  const sortedSearchResults = [...searchResults].sort((a, b) => {
    if (sortMode === 'new') {
      return b.denpa.createdAt - a.denpa.createdAt
    }

    if (sortMode === 'old') {
      return a.denpa.createdAt - b.denpa.createdAt
    }

    return a.denpa.name.localeCompare(b.denpa.name, 'ja')
  })

  const totalPages = Math.ceil(sortedSearchResults.length / itemsPerPage)

  const paginatedSearchResults = sortedSearchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const clearSearchConditions = () => {
    setName('')
    setUuid('')
    setEvasion('')
    setBody('')
    setColorCategory('')
    setColor('')
    setHead('')
    setAntennaCategory('')
    setAntenna('')
    setFeature('')

    setNameRequired(true)
    setEvasionRequired(true)
    setBodyRequired(true)
    setColorRequired(true)
    setHeadRequired(true)
    setAntennaRequired(true)
    setFeatureRequired(true)

    setOptionalMin(0)
  }

  return (
    <div className="app">
      <div className="search-page">
        <Header />

        <main className="list-page">

          {/* 左側：検索条件 */}
          <aside className="list-sidebar search-sidebar">

            <div className="search-form">

              <button
                type="button"
                onClick={clearSearchConditions}
              >
                検索条件をクリア
              </button>

              <div className="form-row">
                <label htmlFor="search-uuid">
                  UUID
                </label>

                <input
                  id="search-uuid"
                  type="text"
                  value={uuid}
                  onChange={(e) => {
                    setUuid(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="特定の１体を検索できます"
                />

              </div>

              <div className="form-row">
                <label htmlFor="search-name">
                  名前
                </label>

                <input
                  id="search-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value

                    setName(value)
                    setCurrentPage(1)

                    if (value === '') {
                      setNameRequired(true)
                    }
                  }}
                  placeholder="名前の一部でも検索できます"
                />

                {name && (
                  <button
                    type="button"
                    className={
                      nameRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setNameRequired(!nameRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {nameRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="form-row">
                <label htmlFor="search-evasion">
                  回避率
                </label>

                <select
                  id="search-evasion"
                  value={evasion}
                  onChange={(e) => {
                    setEvasion(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">
                    指定なし
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

                {evasion && (
                  <button
                    type="button"
                    className={
                      evasionRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setEvasionRequired(!evasionRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {evasionRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="form-row">
                <label htmlFor="search-body">
                  体格
                </label>

                <select
                  id="search-body"
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">
                    指定なし
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

                {body && (
                  <button
                    type="button"
                    className={
                      bodyRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setBodyRequired(!bodyRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {bodyRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="form-row">
                <label>
                  色
                </label>

                <div className="select-group">

                  <select
                    value={colorCategory}
                    onChange={(e) => {
                      const newCategory =
                        e.target.value

                      setColorCategory(newCategory)
                      setColor('')
                      setCurrentPage(1)

                      if (newCategory === '') {
                        setColorRequired(true)
                      }
                    }}
                  >
                    <option value="">
                      指定なし
                    </option>

                    {Object.keys(COLOR_OPTIONS).map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>

                  <span>＞</span>

                  <select
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value)
                      setCurrentPage(1)
                    }}
                    disabled={!colorCategory}
                  >
                    <option value="">
                      指定なし
                    </option>

                    {colorCategory &&
                      COLOR_OPTIONS[
                        colorCategory
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

                {colorCategory !== '' && (
                  <button
                    type="button"
                    className={
                      colorRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setColorRequired(!colorRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {colorRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="form-row">
                <label htmlFor="search-head">
                  頭
                </label>

                <select
                  id="search-head"
                  value={head}
                  onChange={(e) => {
                    setHead(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">
                    指定なし
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

                {head && (
                  <button
                    type="button"
                    className={
                      headRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setHeadRequired(!headRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {headRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="form-row">
                <label>
                  アンテナ
                </label>

                <div className="select-group">

                  <select
                    value={antennaCategory}
                    onChange={(e) => {
                      const newCategory =
                        e.target.value

                      setAntennaCategory(
                        newCategory
                      )

                      setAntenna('')
                      setCurrentPage(1)

                      if (newCategory === '') {
                        setAntennaRequired(true)
                      }
                    }}
                  >
                    <option value="">
                      指定なし
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
                    onChange={(e) => {
                      setAntenna(e.target.value)
                      setCurrentPage(1)
                    }}
                    disabled={!antennaCategory}
                  >
                    <option value="">
                      指定なし
                    </option>

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

                {antennaCategory !== '' && (
                  <button
                    type="button"
                    className={
                      antennaRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setAntennaRequired(!antennaRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {antennaRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="form-row">
                <label htmlFor="search-feature">
                  特徴
                </label>

                <select
                  id="search-feature"
                  value={feature}
                  onChange={(e) => {
                    setFeature(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">
                    指定なし
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

                {feature && (
                  <button
                    type="button"
                    className={
                      featureRequired
                        ? "condition-button required"
                        : "condition-button optional"
                    }
                    onClick={() => {
                      setFeatureRequired(!featureRequired)
                      setCurrentPage(1)
                    }}
                  >
                    {featureRequired ? "必須" : "任意"}
                  </button>
                )}
              </div>

              <div className="search-field">
                <label>
                  任意項目：
                </label>

                <select
                  value={optionalMin}
                  onChange={(e) => {
                    setOptionalMin(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                >
                  {Array.from(
                    { length: optionalConditionCount + 1 },
                    (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    )
                  )}
                </select>

                <span>個以上一致</span>
              </div>

              <div className="search-condition-buttons">

                <button
                  type="button"
                  onClick={() => setConditionMode('register')}
                >
                  現在の検索条件を登録する
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedConditionId(null)
                    setEditingConditionName('')
                    setConditionMode('load')
                  }}
                >
                  登録した検索条件を使う
                </button>
              </div>

            </div>

          </aside>

          {/* 右側 */}
          <section className="list-content">

            {/* 右上 */}
            <div className="list-pagination">
              {conditionMode === 'register' ? null : conditionMode === 'load' ? (
                <div className="condition-mode-title">
                  <button
                    type="button"
                    className="condition-back-button"
                    onClick={() => {
                      setSelectedConditionId(null)
                      setEditingConditionName('')
                      setConditionMode('none')
                    }}
                    aria-label="検索画面に戻る"
                    title="戻る"
                  >
                    ⇦
                  </button>

                  <h2>登録した検索条件を呼び出します</h2>
                </div>
              ) : (
                <div className="search-top-controls">

                  <div className="search-summary-item search-result-count">
                    <span>
                      検索結果：{searchResults.length}件
                    </span>

                    <span>
                      {currentPage} / {totalPages || 1}ページ
                    </span>
                  </div>

                  <div className="search-summary-item">
                    <span>表示件数：</span>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="search-summary-item">
                    <span>並び順：</span>

                    <select
                      value={sortMode}
                      onChange={(e) => {
                        setSortMode(e.target.value as 'new' | 'old' | 'name')
                        setCurrentPage(1)
                      }}
                    >
                      <option value="new">新しく登録した順</option>
                      <option value="old">古く登録した順</option>
                      <option value="name">名前順</option>
                    </select>
                  </div>

                  <div className="search-summary-item">
                    <span>捕獲：</span>

                    <select
                      value={captureSearch}
                      onChange={(e) => {
                        setCaptureSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">指定なし</option>
                      <option value="true">捕獲済み</option>
                      <option value="false">未捕獲</option>
                    </select>
                  </div>

                  <div className="search-summary-item">
                    <span>お気に入り：</span>

                    <select
                      value={favoriteSearch}
                      onChange={(e) => {
                        setFavoriteSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">指定なし</option>
                      <option value="true">お気に入り</option>
                      <option value="false">お気に入りではない</option>
                    </select>
                  </div>

                </div>
              )}
            </div>

            {/* 右下：検索結果 */}
            <div className="search-card-area">

              <button
                type="button"
                className="card-pagination-button card-pagination-prev"
                onClick={() =>
                  setCurrentPage((page) => page - 1)
                }
                disabled={currentPage === 1}
                aria-label="前のページ"
              >
                ＜
              </button>

              <div className="list-cards">

                {conditionMode === 'register' ? (
                  <div className="condition-register">
                    <h3>現在の検索条件をお気に入り登録できます</h3>

                    <label>
                      登録名：
                      <input
                        type="text"
                        value={conditionName}
                        onChange={(e) => setConditionName(e.target.value)}
                      />
                    </label>

                    <div className="condition-register-buttons">
                      <button
                        type="button"
                        onClick={() => {
                          if (conditionName.trim() === '') {
                            alert('登録名を入力してください')
                            return
                          }

                          const newCondition: SearchCondition = {
                            id: crypto.randomUUID(),
                            name: conditionName.trim(),
                            uuid,
                            searchName: name,
                            evasion,
                            body,
                            colorCategory,
                            color,
                            head,
                            antennaCategory,
                            antenna,
                            feature,
                            nameRequired,
                            evasionRequired,
                            bodyRequired,
                            colorRequired,
                            headRequired,
                            antennaRequired,
                            featureRequired,
                            optionalMin,
                            createdAt: Date.now(),
                          }

                          console.log('newCondition作成直後:', newCondition)

                          setSearchConditions((currentConditions) => {
                            const updatedConditions = [
                              ...currentConditions,
                              newCondition,
                            ]

                            console.log('登録するnewCondition:', newCondition)
                            console.log('登録するoptionalMin:', newCondition.optionalMin)

                            localStorage.setItem(
                              'searchConditions',
                              JSON.stringify(updatedConditions)
                            )

                            console.log(
                              'localStorage保存後:',
                              JSON.parse(localStorage.getItem('searchConditions') || '[]')
                            )

                            return updatedConditions
                          })

                          setConditionName('')
                          setConditionMode('none')

                          alert('検索条件をお気に入り登録しました')
                        }}
                      >
                        登録する
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConditionName('')
                          setConditionMode('none')
                        }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : conditionMode === 'load' ? (
                  <div className="condition-load">
                    <div className="condition-load-sort">
                      <label>
                        並び順：
                        <select
                          value={conditionSort}
                          onChange={(event) =>
                            setConditionSort(
                              event.target.value as 'new' | 'old' | 'name'
                            )
                          }
                        >
                          <option value="new">新しい順</option>
                          <option value="old">古い順</option>
                          <option value="name">登録名順</option>
                        </select>
                      </label>
                    </div>

                    <div className="condition-load-content">
                      <div className="condition-load-list">
                        {searchConditions.length === 0 ? (
                          <p>登録した検索条件はありません。</p>
                        ) : (
                          [...searchConditions]
                            .sort((a, b) => {
                              if (conditionSort === 'new') {
                                return b.createdAt - a.createdAt
                              }

                              if (conditionSort === 'old') {
                                return a.createdAt - b.createdAt
                              }

                              return a.name.localeCompare(b.name, 'ja')
                            })
                            .map((condition) => (
                              <div
                                key={condition.id}
                                className="condition-load-item"
                              >
                                <button
                                  type="button"
                                  className="condition-load-item-name"
                                  onClick={() => {
                                    setSelectedConditionId(condition.id)
                                    setEditingConditionName(condition.name)
                                  }}
                                >
                                  {condition.name}
                                </button>

                                <button
                                  type="button"
                                  className="condition-load-delete-button"
                                  onClick={() => {
                                    const shouldDelete = window.confirm(
                                      `「${condition.name}」を削除しますか？`
                                    )

                                    if (!shouldDelete) {
                                      return
                                    }

                                    setSearchConditions((currentConditions) => {
                                      const updatedConditions = currentConditions.filter(
                                        (item) => item.id !== condition.id
                                      )

                                      localStorage.setItem(
                                        'searchConditions',
                                        JSON.stringify(updatedConditions)
                                      )

                                      return updatedConditions
                                    })

                                    if (selectedConditionId === condition.id) {
                                      setSelectedConditionId(null)
                                      setEditingConditionName('')
                                    }

                                  }}
                                  aria-label={`${condition.name}を削除`}
                                  title="検索条件を削除"
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M5 7H19"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />

                                    <path
                                      d="M10 7V5H14V7"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />

                                    <path
                                      d="M8 7L9 20H15L16 7"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />

                                    <path
                                      d="M10 11V16"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />

                                    <path
                                      d="M14 11V16"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))
                        )}
                      </div>

                      <div className="condition-load-detail">
                        {selectedConditionId === null ? (
                          <p>検索条件を選択してください。</p>
                        ) : (
                          (() => {
                            const selectedCondition = searchConditions.find(
                              (condition) => condition.id === selectedConditionId
                            )

                            if (!selectedCondition) {
                              return <p>検索条件を選択してください。</p>
                            }

                            return (
                              <>
                                <div className="condition-load-name">
                                  <input
                                    type="text"
                                    value={editingConditionName}
                                    onChange={(event) => setEditingConditionName(event.target.value)}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editingConditionName.trim() === '') {
                                        alert('登録名を入力してください')
                                        return
                                      }

                                      setSearchConditions((currentConditions) => {
                                        const updatedConditions = currentConditions.map((condition) =>
                                          condition.id === selectedCondition.id
                                            ? {
                                              ...condition,
                                              name: editingConditionName.trim(),
                                            }
                                            : condition
                                        )

                                        localStorage.setItem(
                                          'searchConditions',
                                          JSON.stringify(updatedConditions)
                                        )

                                        return updatedConditions
                                      })

                                      alert('登録名を変更しました')
                                    }}
                                  >
                                    登録名を変更
                                  </button>

                                </div>

                                <div className="condition-preview">
                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">UUID</span>
                                    <span className="condition-preview-colon">：</span>
                                    <span className="condition-preview-value">
                                      {selectedCondition.uuid || '指定なし'}
                                    </span>
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">名前</span>
                                    <span className="condition-preview-colon">：</span>
                                    <span
                                      className={
                                        selectedCondition.searchName
                                          ? selectedCondition.nameRequired
                                            ? 'search-match search-match-required'
                                            : 'search-match search-match-optional'
                                          : 'condition-preview-value'
                                      }
                                    >
                                      {selectedCondition.searchName || '指定なし'}
                                    </span>
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">回避率</span>
                                    <span className="condition-preview-colon">：</span>
                                    <span
                                      className={
                                        selectedCondition.evasion
                                          ? selectedCondition.evasionRequired
                                            ? 'search-match search-match-required'
                                            : 'search-match search-match-optional'
                                          : 'condition-preview-value'
                                      }
                                    >
                                      {selectedCondition.evasion || '指定なし'}
                                    </span>
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">体格</span>
                                    <span className="condition-preview-colon">：</span>
                                    <span
                                      className={
                                        selectedCondition.body
                                          ? selectedCondition.bodyRequired
                                            ? 'search-match search-match-required'
                                            : 'search-match search-match-optional'
                                          : 'condition-preview-value'
                                      }
                                    >
                                      {selectedCondition.body || '指定なし'}
                                    </span>
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">色</span>
                                    <span className="condition-preview-colon">：</span>

                                    {(selectedCondition.colorCategory || selectedCondition.color) ? (
                                      <>
                                        <span
                                          className={
                                            selectedCondition.colorRequired
                                              ? 'search-match search-match-required'
                                              : 'search-match search-match-optional'
                                          }
                                        >
                                          {selectedCondition.colorCategory || '指定なし'}
                                        </span>

                                        <span>　＞　</span>

                                        <span
                                          className={
                                            selectedCondition.colorRequired
                                              ? 'search-match search-match-required'
                                              : 'search-match search-match-optional'
                                          }
                                        >
                                          {selectedCondition.color || '指定なし'}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="condition-preview-value">
                                        指定なし
                                      </span>
                                    )}
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">頭</span>
                                    <span className="condition-preview-colon">：</span>
                                    <span
                                      className={
                                        selectedCondition.head
                                          ? selectedCondition.headRequired
                                            ? 'search-match search-match-required'
                                            : 'search-match search-match-optional'
                                          : 'condition-preview-value'
                                      }
                                    >
                                      {selectedCondition.head || '指定なし'}
                                    </span>
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">アンテナ</span>
                                    <span className="condition-preview-colon">：</span>

                                    {(selectedCondition.antennaCategory || selectedCondition.antenna) ? (
                                      <>
                                        <span
                                          className={
                                            selectedCondition.antennaRequired
                                              ? 'search-match search-match-required'
                                              : 'search-match search-match-optional'
                                          }
                                        >
                                          {selectedCondition.antennaCategory || '指定なし'}
                                        </span>

                                        <span>　＞　</span>

                                        <span
                                          className={
                                            selectedCondition.antennaRequired
                                              ? 'search-match search-match-required'
                                              : 'search-match search-match-optional'
                                          }
                                        >
                                          {selectedCondition.antenna || '指定なし'}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="condition-preview-value">
                                        指定なし
                                      </span>
                                    )}
                                  </div>

                                  <div className="condition-preview-row">
                                    <span className="condition-preview-label">特徴</span>
                                    <span className="condition-preview-colon">：</span>
                                    <span
                                      className={
                                        selectedCondition.feature
                                          ? selectedCondition.featureRequired
                                            ? 'search-match search-match-required'
                                            : 'search-match search-match-optional'
                                          : 'condition-preview-value'
                                      }
                                    >
                                      {selectedCondition.feature || '指定なし'}
                                    </span>
                                  </div>

                                  <div className="condition-preview-optional-min">
                                    任意項目：{selectedCondition.optionalMin}個以上一致
                                  </div>
                                </div>

                                <button className='condition-apply-button'
                                  type="button"
                                  onClick={() => {
                                    setUuid(selectedCondition.uuid)
                                    setName(selectedCondition.searchName)
                                    setEvasion(selectedCondition.evasion)
                                    setBody(selectedCondition.body)
                                    setColorCategory(selectedCondition.colorCategory)
                                    setColor(selectedCondition.color)
                                    setHead(selectedCondition.head)
                                    setAntennaCategory(selectedCondition.antennaCategory)
                                    setAntenna(selectedCondition.antenna)
                                    setFeature(selectedCondition.feature)

                                    setNameRequired(selectedCondition.nameRequired)
                                    setEvasionRequired(selectedCondition.evasionRequired)
                                    setBodyRequired(selectedCondition.bodyRequired)
                                    setColorRequired(selectedCondition.colorRequired)
                                    setHeadRequired(selectedCondition.headRequired)
                                    setAntennaRequired(selectedCondition.antennaRequired)
                                    setFeatureRequired(selectedCondition.featureRequired)

                                    setOptionalMin(selectedCondition.optionalMin)

                                    setConditionMode('none')
                                    setSelectedConditionId(null)
                                  }}
                                >
                                  この検索条件を使う
                                </button>

                              </>
                            )
                          })()
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <>

                    {searchResults.length === 0 ? (

                      <p>条件に一致する電波人間はいません。</p>

                    ) : (

                      <div className="denpa-list">

                        {paginatedSearchResults.map(
                          (result) => {

                            const denpa = result.denpa
                            const match = result.match

                            const getMatchClass =
                              (field: string) => {
                                if (
                                  match.required.includes(
                                    field
                                  )
                                ) {
                                  return 'search-match search-match-required'
                                }

                                if (
                                  match.optional.includes(
                                    field
                                  )
                                ) {
                                  return 'search-match search-match-optional'
                                }

                                return ''
                              }

                            return (
                              <div
                                className="denpa-card"
                                key={denpa.id}
                              >

                                <div className="denpa-info">

                                  <div className="name-uuid-row">

                                    <button
                                      type="button"
                                      className={`favorite-star ${denpa.favorite
                                        ? 'active'
                                        : ''
                                        }`}
                                      onClick={() => {
                                        setDenpaList(
                                          (currentList) =>
                                            currentList.map(
                                              (item) =>
                                                item.id ===
                                                  denpa.id
                                                  ? {
                                                    ...item,
                                                    favorite:
                                                      !item.favorite,
                                                  }
                                                  : item
                                            )
                                        )
                                      }}
                                      aria-label="お気に入り"
                                      title="お気に入り"
                                    >
                                      ★
                                    </button>

                                    <h3 className="denpa-name">
                                      <span
                                        className={getMatchClass(
                                          '名前'
                                        )}
                                      >
                                        {denpa.name ||
                                          '名前未設定'}
                                      </span>
                                    </h3>

                                  </div>

                                  <p className="denpa-status">
                                    回避率：
                                    <span
                                      className={getMatchClass(
                                        '回避率'
                                      )}
                                    >
                                      {denpa.evasion ||
                                        '未設定'}
                                    </span>
                                  </p>

                                  <p className="denpa-status">
                                    体格：
                                    <span
                                      className={getMatchClass(
                                        '体格'
                                      )}
                                    >
                                      {denpa.body ||
                                        '未設定'}
                                    </span>
                                  </p>

                                  <p className="denpa-status">
                                    色：
                                    <span
                                      className={getMatchClass(
                                        '色'
                                      )}
                                    >
                                      {denpa.colorCategory || '未設定'}
                                      {' ＞ '}
                                      {denpa.color || '未設定'}
                                    </span>
                                  </p>

                                  <p className="denpa-status">
                                    頭：
                                    <span
                                      className={getMatchClass(
                                        '頭'
                                      )}
                                    >
                                      {denpa.head ||
                                        '未設定'}
                                    </span>
                                  </p>

                                  <p className="denpa-status">
                                    アンテナ：
                                    <span
                                      className={getMatchClass(
                                        'アンテナ'
                                      )}
                                    >
                                      {denpa.antennaCategory || '未設定'}
                                      {' ＞ '}
                                      {denpa.antenna || '未設定'}
                                    </span>
                                  </p>

                                  <p className="denpa-status">
                                    特徴：
                                    <span
                                      className={getMatchClass(
                                        '特徴'
                                      )}
                                    >
                                      {denpa.feature ||
                                        '未設定'}
                                    </span>
                                  </p>

                                </div>

                                <div className="card-side">

                                  <div className="qr-area">

                                    <div className="denpa-uuid">

                                      <span>
                                        UUID: {denpa.id.slice(0, 12)}...
                                      </span>

                                      <button
                                        type="button"
                                        className="copy-button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(denpa.id)
                                          alert('UUIDをコピーしました')
                                        }}
                                        aria-label="UUIDをコピー"
                                        title="UUIDをコピー"
                                      >
                                        <svg
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          aria-hidden="true"
                                        >
                                          <rect
                                            x="9"
                                            y="9"
                                            width="11"
                                            height="11"
                                            rx="2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          />

                                          <path
                                            d="M15 9V6C15 4.89543 14.1046 4 13 4H6C4.89543 4 4 4.89543 4 6V13C4 14.1046 4.89543 15 6 15H9"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          />
                                        </svg>
                                      </button>

                                    </div>


                                    <div
                                      className={`qr-image-wrapper ${denpa.capture ? 'captured' : ''
                                        }`}
                                      onClick={() => {
                                        setDenpaList((currentList) =>
                                          currentList.map((item) =>
                                            item.id === denpa.id
                                              ? {
                                                ...item,
                                                capture: !item.capture,
                                              }
                                              : item
                                          )
                                        )
                                      }}
                                    >
                                      <img
                                        className="list-qr"
                                        src={
                                          denpa.qrFile
                                            ? URL.createObjectURL(denpa.qrFile)
                                            : '/denpa-qr-web/no-image.jpg'
                                        }
                                        alt={
                                          denpa.qrFile
                                            ? `${denpa.name}のQRコード`
                                            : 'QR画像なし'
                                        }
                                      />

                                      <button
                                        type="button"
                                        className="qr-expand-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setExpandedQr(denpa)
                                        }}
                                        aria-label="QRコードを拡大"
                                        title="QRコードを拡大"
                                      >
                                        ⛶
                                      </button>

                                      {denpa.capture && (
                                        <div className="captured-label">
                                          捕獲済み
                                        </div>
                                      )}
                                    </div>

                                  </div>


                                  <div className="card-buttons">

                                    <button
                                      type="button"
                                      className="edit-button"
                                      onClick={() =>
                                        navigate(`/edit/${denpa.id}`, {
                                          state: {
                                            from: 'search', searchPageState: {
                                              uuid,
                                              name,
                                              evasion,
                                              body,
                                              colorCategory,
                                              color,
                                              head,
                                              antennaCategory,
                                              antenna,
                                              feature,
                                              captureSearch,
                                              favoriteSearch,
                                              sortMode,
                                              currentPage,
                                              itemsPerPage,
                                              nameRequired,
                                              evasionRequired,
                                              bodyRequired,
                                              colorRequired,
                                              headRequired,
                                              antennaRequired,
                                              featureRequired,
                                              optionalMin,
                                            } satisfies SearchPageState,
                                          },
                                        })
                                      }
                                    >

                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M13.5 6.5L17.5 10.5"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>


                                    <button
                                      type="button"
                                      className="delete-button"
                                      onClick={() =>
                                        handleDelete(denpa.id)
                                      }
                                    >
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M5 7H19"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />

                                        <path
                                          d="M10 7V5H14V7"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M8 7L9 20H15L16 7"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M10 11V16"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />

                                        <path
                                          d="M14 11V16"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>

                                  </div>

                                </div>

                              </div>
                            )
                          }
                        )}

                      </div>

                    )}

                  </>
                )}

              </div>

              <button
                type="button"
                className="card-pagination-button card-pagination-next"
                onClick={() =>
                  setCurrentPage((page) => page + 1)
                }
                disabled={
                  currentPage === totalPages ||
                  totalPages === 0
                }
                aria-label="次のページ"
              >
                ＞
              </button>

            </div>

          </section>

          {expandedQr && (
            <div
              className="qr-modal-overlay"
              onClick={() => setExpandedQr(null)}
            >
              <div
                className="qr-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="qr-modal-close"
                  onClick={() => setExpandedQr(null)}
                  aria-label="閉じる"
                  title="閉じる"
                >
                  ×
                </button>

                <img
                  className="qr-modal-image"
                  src={
                    expandedQr.qrFile
                      ? URL.createObjectURL(expandedQr.qrFile)
                      : '/denpa-qr-web/no-image.jpg'
                  }
                  alt={
                    expandedQr.qrFile
                      ? `${expandedQr.name}のQRコード`
                      : 'QR画像なし'
                  }
                />

                <div className="qr-modal-name">
                  {expandedQr.name || '名前未設定'}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Search