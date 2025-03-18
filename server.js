import express from 'express'
import { bugService } from './public/services/bug.service.js'
const app = express()

app.use(express.static('public'))

//* Express Routing:

//* Read
app.get('/api/bug', (req, res) => {
  bugService
    .query()
    .then((bugs) => res.send(bugs))
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

const port = 3030
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))
