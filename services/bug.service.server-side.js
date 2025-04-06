import { utilService } from './util.service.js'
import fs from 'fs'

const bugs = utilService.readJsonFile('./data/bug.json')

export const bugService = {
  query,
  getById,
  remove,
  save,
  getDefaultFilter,
  getAvailableLabels,
}

function query(filterBy) {
  return Promise.resolve(bugs)
}

function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
  if (!loggedinUser) return Promise.reject('Not authorized')

  const bugIdx = bugs.findIndex((bug) => bug._id === bugId)
  if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)

  const bug = bugs[bugIdx]

  if (!loggedinUser.isAdmin && bug.creator?._id !== loggedinUser._id) {
    return Promise.reject('Unauthorized')
  }

  bugs.splice(bugIdx, 1)
  return _savebugsToFile()
}

function save(bugToSave, loggedinUser) {
  if (!loggedinUser) return Promise.reject('Not authorized')

  if (bugToSave._id) {
    const bugIdx = bugs.findIndex((bug) => bug._id === bugToSave._id)
    if (bugIdx === -1) return Promise.reject('Bug not found')

    const bug = bugs[bugIdx]
    if (!loggedinUser.isAdmin && bug.creator._id !== loggedinUser._id) {
      return Promise.reject('Unauthorized')
    }

    bugs[bugIdx] = { ...bugToSave }
    bugs[bugIdx].createdAt = Date.now()
    bugs[bugIdx].creator = bug.creator
  } else {
    bugToSave._id = utilService.makeId()
    bugToSave.createdAt = Date.now()
    bugToSave.creator = {
      _id: loggedinUser._id,
      fullname: loggedinUser.fullname,
    }
    bugs.unshift(bugToSave)
  }

  return _savebugsToFile().then(() => bugToSave)
}

function _savebugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bugs, null, 4)
    fs.writeFile('data/bug.json', data, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function getAvailableLabels() {
  const labelSet = new Set()

  bugs.forEach((bug) => {
    if (Array.isArray(bug.labels)) {
      bug.labels.forEach((label) => labelSet.add(label))
    }
  })

  return Promise.resolve([...labelSet])
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0 }
}
