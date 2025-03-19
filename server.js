import cookieParser from 'cookie-parser'
import express from 'express'
import { bugService } from './public/services/bug.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())

//* Express Routing:

//* Read (returns all bugs or filtered results)
app.get('/api/bug', (req, res) => {
  const { title, severity, description } = req.query

  bugService
    .query()
    .then((bugs) => {
      let filteredBugs = bugs

      if (title) filteredBugs = filteredBugs.filter((bug) => bug.title.toLowerCase().includes(title.toLowerCase()))
      if (severity) filteredBugs = filteredBugs.filter((bug) => bug.severity === +severity)
      if (description) filteredBugs = filteredBugs.filter((bug) => bug.description.toLowerCase().includes(description.toLowerCase()))

      res.send(filteredBugs)
    })
    .catch((err) => {
      console.log('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
    })
})

//* Create/Edit
app.get('/api/bug/save', (req, res) => {
  const bugToSave = {
    _id: req.query._id,
    title: req.query.title,
    description: req.query.description,
    severity: +req.query.severity,
    createdAt: +req.query.createdAt,
  }

  bugService
    .save(bugToSave)
    .then((bug) => res.send(bug))
    .catch((err) => {
      console.log('Cannot save bug', err)
      res.status(500).send('Cannot save bug')
    })
})

//* Get/Read by id
app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params

  let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

  if (visitedBugs.length >= 1) return res.status(401).send('wait for bit')

  if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
  res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 7, httpOnly: true })
  console.log('Visited Bugs:', visitedBugs)

  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      console.log('Cannot get bug', err)
      res.status(500).send('Cannot load bug')
    })
})

//* Remove/Delete
app.get('/api/bug/:bugId/remove', (req, res) => {
  const { bugId } = req.params
  bugService
    .remove(bugId)
    .then(() => res.send('bug Removed'))
    .catch((err) => {
      console.log('Cannot remove bug', err)
      res.status(500).send('Cannot remove bug')
    })
})

//* Save/Update
app.get('/api/bug/save/', (req, res) => {
  const bugToSave = {
    _id: req.query._id || null,
    title: req.query.title,
    description: req.query.description,
    severity: +req.query.severity,
    createdAt: Date.now(),
  }

  bugService
    .save(bugToSave)
    .then((bug) => res.send(bug))
    .catch((err) => {
      console.log('Cannot save bug', err)
      res.status(500).send('Cannot save bug')
    })
})

app.get('/', (req, res) => {
  res.send('Hello And Welcome')
})

function saveBugVisitToCookies(req) {
  const { bugId } = req.params
  let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

  if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
  res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 60 * 60 * 24, httpOnly: true })
  console.log('Visited Bugs:', visitedBugs)
}

const port = 3030
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))
