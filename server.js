import cookieParser from 'cookie-parser'
import express from 'express'
import PDFDocument from 'pdfkit'
import bodyParser from 'body-parser'

import { bugService } from './services/bug.service.server-side.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(bodyParser.json())

app.get('/api/bug', (req, res) => {
  const { title, severity, description, labels, sortBy, sortOrder, pageIdx = 0, pageSize = 5 } = req.query

  bugService
    .query()
    .then((bugs) => {
      let filteredBugs = bugs

      if (title) {
        filteredBugs = filteredBugs.filter((bug) => bug.title.toLowerCase().includes(title.toLowerCase()))
      }

      if (description) {
        filteredBugs = filteredBugs.filter((bug) => bug.description.toLowerCase().includes(description.toLowerCase()))
      }

      if (severity !== undefined && severity !== '') {
        filteredBugs = filteredBugs.filter((bug) => bug.severity >= +severity)
      }

      if (labels) {
        const labelList = labels.map((label) => label.trim().toLowerCase())
        filteredBugs = filteredBugs.filter((bug) => bug.labels?.some((label) => labelList.includes(label.toLowerCase())))
      }

      if (sortBy) {
        const order = sortOrder === 'desc' ? -1 : 1

        filteredBugs.sort((a, b) => {
          const aVal = a[sortBy]
          const bVal = b[sortBy]

          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal) * order
          } else {
            return (aVal - bVal) * order
          }
        })
      }

      const start = pageIdx * pageSize
      const end = start + +pageSize
      const pagedBugs = filteredBugs.slice(start, end)
      res.send({ bugs: pagedBugs, totalPages: Math.ceil(filteredBugs.length / pageSize) })
    })
    .catch((err) => {
      loggerService.error('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
    })
})

app.get('/api/bug/by-user/:userId', (req, res) => {
  const { userId } = req.params

  bugService
    .query()
    .then((bugs) => {
      const userBugs = bugs.filter((bug) => bug.creator?._id === userId)
      res.send(userBugs)
    })
    .catch((err) => {
      loggerService.error('Failed to get bugs by user', err)
      res.status(500).send('Failed to get bugs by user')
    })
})

app.get('/api/bug/labels', (req, res) => {
  bugService
    .getAvailableLabels()
    .then((labels) => res.send(labels))
    .catch((err) => {
      loggerService.error('Cannot get labels', err)
      res.status(500).send('Failed to load labels')
    })
})

app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params
  let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

  if (visitedBugs.length >= 3) return res.status(401).send('wait for bit')

  if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
  res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 7, httpOnly: true })

  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot get bug', err)
      res.status(500).send('Cannot load bug')
    })
})

app.get('/api/bug/:bugId/pdf', (req, res) => {
  const { bugId } = req.params

  bugService
    .getById(bugId)
    .then((bug) => {
      if (!bug) return res.status(404).send('Bug not found')

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=bug_${bugId}_report.pdf`)

      const doc = new PDFDocument()
      doc.pipe(res)

      doc.fontSize(16).text('Bug Report', { align: 'center' }).moveDown()

      doc.fontSize(12)
      doc.text(`ID: ${bug._id}`)
      doc.text(`Title: ${bug.title}`)
      doc.text(`Description: ${bug.description}`)
      doc.text(`Severity: ${bug.severity}`)
      doc.text(`Created At: ${new Date(bug.createdAt).toLocaleString()}`)

      if (bug.labels && bug.labels.length) {
        doc.text(`Labels: ${bug.labels.join(', ')}`)
      }

      doc.end()
    })
    .catch((err) => {
      loggerService.error('Cannot generate PDF', err)
      res.status(500).send('Failed to generate PDF')
    })
})

app.post('/api/bug', (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Unauthorized')

  const bugToSave = {
    ...req.body,
    createdAt: Date.now(),
  }

  bugService
    .save(bugToSave, loggedinUser)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot create bug', err)
      res.status(500).send('Cannot create bug')
    })
})

app.put('/api/bug/:bugId', (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Unauthorized')

  const bugToUpdate = {
    ...req.body,
    _id: req.params.bugId,
  }

  bugService
    .save(bugToUpdate, loggedinUser)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot update bug', err)
      res.status(500).send('Cannot update bug')
    })
})

app.delete('/api/bug/:bugId', (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Unauthorized')

  const { bugId } = req.params

  bugService
    .remove(bugId, loggedinUser)
    .then(() => res.send('Bug removed'))
    .catch((err) => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot remove bug')
    })
})

app.get('/api/user', (req, res) => {
  userService
    .query()
    .then((users) => res.send(users))
    .catch((err) => {
      loggerService.error('Cannot load users', err)
      res.status(400).send('Cannot load users')
    })
})

app.post('/api/user', (req, res) => {
  const user = req.body

  userService
    .add(user)
    .then((savedUser) => res.send(savedUser))
    .catch((err) => {
      loggerService.error('Cannot add user', err)
      res.status(500).send('Cannot add user')
    })
})

app.put('/api/user/:userId', (req, res) => {
  const user = { ...req.body, _id: req.params.userId }

  userService
    .update(user)
    .then((savedUser) => res.send(savedUser))
    .catch((err) => {
      loggerService.error('Cannot update user', err)
      res.status(500).send('Cannot update user')
    })
})

app.delete('/api/user/:userId', (req, res) => {
  const { userId } = req.params

  bugService
    .query()
    .then((bugs) => {
      const userHasBugs = bugs.some((bug) => bug.creator && bug.creator._id === userId)
      if (userHasBugs) {
        return res.status(400).send('Cannot remove user - has assigned bugs')
      }

      return userService.remove(userId, req)
    })
    .then(() => res.send({ msg: 'User removed' }))
    .catch((err) => {
      loggerService.error('Cannot remove user', err)
      res.status(500).send('Cannot remove user')
    })
})

app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params

  userService
    .getById(userId)
    .then((user) => res.send(user))
    .catch((err) => {
      loggerService.error('Cannot load user', err)
      res.status(400).send('Cannot load user')
    })
})

app.post('/api/auth/login', (req, res) => {
  const credentials = req.body

  authService
    .checkLogin(credentials)
    .then((user) => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    })
    .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body

  userService
    .add(credentials)
    .then((user) => {
      if (user) {
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
      } else {
        res.status(400).send('Cannot signup')
      }
    })
    .catch((err) => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

app.get('/', (req, res) => {
  res.send('Hello And Welcome')
})

const port = 3030
app.listen(port, () => console.log(`Server listening on http://127.0.0.1:${port}/`))
