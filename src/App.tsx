import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import './App.css'

import Home from './components/Home'
import Save from './components/Save'
import QrHistoryPage from './components/QrHistory'
import Edit from './components/Edit'
import Search from './components/Search'
import BirthRoute from './components/BirthRoute'

import type { DenpaData } from './types/denpa'
import type { QrHistory as QrHistoryType } from './types/qr'
import type { SearchCondition } from './types/search'

import {
  loadDenpaList,
  saveDenpaList,
} from './utils/denpaStorage'

import {
  loadQrHistory,
  saveQrHistory,
} from './utils/qrHistoryStorage'

import {
  loadSearchConditions,
  saveSearchConditions,
} from './utils/searchConditionStorage'

function App() {
  const [denpaList, setDenpaList] =
    useState<DenpaData[]>([])

  const [isDenpaListLoaded, setIsDenpaListLoaded] = useState(false)

  const [qrHistory, setQrHistory] =
    useState<QrHistoryType[]>(loadQrHistory)

  const [searchConditions, setSearchConditions] =
    useState<SearchCondition[]>(loadSearchConditions)

  useEffect(() => {
    const loadData = async () => {
      const restoredData = await loadDenpaList()

      setDenpaList(restoredData)
      setIsDenpaListLoaded(true)
    }

    loadData()
  }, [])

  useEffect(() => {
    saveQrHistory(qrHistory)
  }, [qrHistory])

  useEffect(() => {
    saveSearchConditions(searchConditions)
  }, [searchConditions])

  // ========================================
  // denpaListが変更されたら保存する
  // ========================================

  useEffect(() => {
    if (!isDenpaListLoaded) {
      return
    }

    const saveData = async () => {
      try {
        await saveDenpaList(denpaList)
      } catch (error) {
        console.error(
          'データの保存に失敗しました:',
          error
        )
      }
    }

    saveData()
  }, [denpaList, isDenpaListLoaded])

  return (
    <BrowserRouter basename="/denpa-qr-web">
      <Routes>

        <Route
          path="/"
          element={
            <Home
              denpaList={denpaList}
              setDenpaList={setDenpaList}
              qrHistory={qrHistory}
              searchConditions={searchConditions}
              setQrHistory={setQrHistory}
              setSearchConditions={setSearchConditions}
            />
          }
        />

        <Route
          path="/save"
          element={
            <Save
              setDenpaList={setDenpaList}
              setQrHistory={setQrHistory}
            />
          }
        />

        <Route
          path="/edit/:id"
          element={
            <Edit
              denpaList={denpaList}
              setDenpaList={setDenpaList}
            />
          }
        />

        <Route
          path="/search"
          element={
            <Search
              denpaList={denpaList}
              setDenpaList={setDenpaList}
              searchConditions={searchConditions}
              setSearchConditions={setSearchConditions}
            />
          }
        />

        <Route
          path="/qr-history"
          element={
            <QrHistoryPage
              qrHistory={qrHistory}
            />
          }
        />

        <Route
          path="/birth-route"
          element={<BirthRoute />}
        />
        
      </Routes>

    </BrowserRouter>
  )
}

export default App