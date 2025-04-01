import fs from 'fs'
import { utilService } from './util.service.js'
import { authService } from './auth.service.js' // אם לא קיים כבר

let users = utilService.readJsonFile('data/user.json')

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  add,
  update,
}

function query() {
  const usersToReturn = users.map((user) => ({ _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }))
  return Promise.resolve(usersToReturn)
}

function getById(userId) {
  const user = users.find((user) => user._id === userId)
  if (!user) return Promise.reject('User not found!')
  const userCopy = { ...user }
  delete userCopy.password
  return Promise.resolve(userCopy)
}

function getByUsername(username) {
  const user = users.find((user) => user.username === username)
  return Promise.resolve(user)
}

function remove(userId, req) {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return Promise.reject('Not authorized')

  const idx = users.findIndex((user) => user._id === userId)
  if (idx === -1) return Promise.reject('User not found')

  const user = users[idx]
  if (!loggedinUser.isAdmin && user._id !== loggedinUser._id) {
    return Promise.reject('Unauthorized')
  }

  users.splice(idx, 1)
  return _saveUsersToFile()
}

function add(user) {
  return getByUsername(user.username).then((existingUser) => {
    if (existingUser) return Promise.reject('Username taken')

    user._id = utilService.makeId()
    users.push(user)

    return _saveUsersToFile().then(() => {
      const userCopy = { ...user }
      delete userCopy.password
      return userCopy
    })
  })
}

function update(userToUpdate, loggedinUser) {
  if (!loggedinUser) return Promise.reject('Not authorized')

  const idx = users.findIndex((user) => user._id === userToUpdate._id)
  if (idx === -1) return Promise.reject('User not found')

  if (!loggedinUser.isAdmin && users[idx]._id !== loggedinUser._id) {
    return Promise.reject('Unauthorized')
  }

  users[idx] = { ...users[idx], ...userToUpdate }
  return _saveUsersToFile().then(() => {
    const userCopy = { ...users[idx] }
    delete userCopy.password
    return userCopy
  })
}

function _saveUsersToFile() {
  return new Promise((resolve, reject) => {
    const usersStr = JSON.stringify(users, null, 2)
    fs.writeFile('data/user.json', usersStr, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
