import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'

_createBugs()

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
}

function query(filterBy) {
  return storageService.query(STORAGE_KEY).then((bugs) => {
    if (filterBy.txt) {
      const regExp = new RegExp(filterBy.txt, 'i')
      bugs = bugs.filter((bug) => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
      bugs = bugs.filter((bug) => bug.severity >= filterBy.minSeverity)
    }

    return bugs
  })
}

function getById(bugId) {
  return storageService.get(STORAGE_KEY, bugId)
}

function remove(bugId) {
  return storageService.remove(STORAGE_KEY, bugId)
}

function save(bug) {
  if (bug._id) {
    return storageService.put(STORAGE_KEY, bug)
  } else {
    return storageService.post(STORAGE_KEY, bug)
  }
}

function _createBugs() {
  let bugs = utilService.loadFromStorage(STORAGE_KEY)
  if (bugs && bugs.length > 0) return

  bugs = [
    {
      title: 'Infinite Loop Detected',
      description: 'The application enters an infinite loop when processing large datasets.',
      severity: 4,
      _id: '1NF1N1T3',
    },
    {
      title: 'Keyboard Not Found',
      description: 'User cannot type because the keyboard is not recognized by the system.',
      severity: 3,
      _id: 'K3YB0RD',
    },
    {
      title: '404 Coffee Not Found',
      description: 'The coffee machine fails to deliver coffee, causing developer productivity issues.',
      severity: 2,
      _id: 'C0FF33',
    },
    {
      title: 'Unexpected Response',
      description: 'The API returns an incorrect response format, breaking frontend functionality.',
      severity: 1,
      _id: 'G0053',
    },
  ]

  utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0 }
}
