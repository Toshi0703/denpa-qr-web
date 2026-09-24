const QR_DB_NAME = 'denpaQrDatabase'
const QR_STORE_NAME = 'qrFiles'

export const openQrDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(QR_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(QR_STORE_NAME)) {
        db.createObjectStore(QR_STORE_NAME)
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const saveQrFile = async (
  id: string,
  file: File
): Promise<void> => {
  const db = await openQrDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      QR_STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(QR_STORE_NAME)

    store.put(file, id)

    transaction.oncomplete = () => {
      db.close()
      resolve()
    }

    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

export const getQrFile = async (
  id: string
): Promise<File | null> => {
  const db = await openQrDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      QR_STORE_NAME,
      'readonly'
    )

    const store = transaction.objectStore(QR_STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => {
      db.close()

      const file = request.result

      if (file instanceof File) {
        resolve(file)
        return
      }

      if (file instanceof Blob) {
        resolve(
          new File(
            [file],
            `${id}.png`,
            { type: file.type || 'image/png' }
          )
        )
        return
      }

      resolve(null)
    }

    request.onerror = () => {
      db.close()
      reject(request.error)
    }
  })
}