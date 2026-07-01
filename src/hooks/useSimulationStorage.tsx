import {
  type SimulationFormData,
  type SimulationRecord,
} from '@/data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

function readSavedData() {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (!storage) {
    return []
  }

  try {
    return JSON.parse(storage) as SimulationRecord[]
  } catch {
    return []
  }
}

function writeSavedData(records: SimulationRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records))
}

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
    }

    const savedData = readSavedData()

    writeSavedData([...savedData, record])

    return id
  }

  const getFormData = (id: string) => {
    return readSavedData().find((record) => record.id === id) || null
  }

  const getAllFormData = () => {
    return readSavedData()
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const savedData = readSavedData()

    const updated = savedData.map((record) =>
      record.id === id ? { ...data } : record,
    )

    writeSavedData(updated)
  }

  const deleteSimulation = (id: string) => {
    const savedData = readSavedData()
    writeSavedData(savedData.filter((record) => record.id !== id))
  }

  return {
    saveFormData,
    getFormData,
    getAllFormData,
    updateSimulation,
    deleteSimulation,
  }
}
