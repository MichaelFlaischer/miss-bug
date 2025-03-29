import cookieParser from 'cookie-parser'
import express from 'express'
import PDFDocument from 'pdfkit'
import bodyParser from 'body-parser'

import { bugService } from './services/bug.service.server-side.js'
import { loggerService } from './services/logger.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(bodyParser.json())

app.get('/api/bug', (req, res) => {
  const { title, severity, description, labels } = req.query

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
        const labelList = labels.split(',').map((label) => label.trim().toLowerCase())
        filteredBugs = filteredBugs.filter((bug) => bug.labels?.some((label) => labelList.includes(label.toLowerCase())))
      }

      res.send(filteredBugs)
    })
    .catch((err) => {
      loggerService.error('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
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
  const bugToSave = {
    ...req.body,
    createdAt: Date.now(),
  }

  bugService
    .save(bugToSave)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot create bug', err)
      res.status(500).send('Cannot create bug')
    })
})

app.put('/api/bug/:bugId', (req, res) => {
  const bugToUpdate = {
    ...req.body,
    _id: req.params.bugId,
  }

  bugService
    .save(bugToUpdate)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot update bug', err)
      res.status(500).send('Cannot update bug')
    })
})

app.delete('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params

  bugService
    .remove(bugId)
    .then(() => res.send('Bug removed'))
    .catch((err) => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot remove bug')
    })
})

app.get('/', (req, res) => {
  res.send('Hello And Welcome')
})

const port = 3030
app.listen(port, () => console.log(`Server listening on http://127.0.0.1:${port}/`))
