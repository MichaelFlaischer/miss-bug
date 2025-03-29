import { utilService } from './util.service.js'
import fs from 'fs'

const bugs = utilService.readJsonFile('./data/bug.json')

export const bugService = {
  query,
  getById,
  remove,
  save,
  getDefaultFilter,
}

function query(filterBy) {
  return Promise.resolve(bugs)
}

function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId) {
  const bugIdx = bugs.findIndex((bug) => bug._id === bugId)
  if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
  bugs.splice(bugIdx, 1)
  return _savebugsToFile()
}

function save(bugToSave) {
  if (bugToSave._id) {
    const bugIdx = bugs.findIndex((bug) => bug._id === bugToSave._id)
    bugs[bugIdx] = bugToSave
    bugs[bugIdx].createdAt = Date.now()
  } else {
    bugToSave._id = utilService.makeId()
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

function getDefaultFilter() {
  return { txt: '', minSeverity: 0 }
}
