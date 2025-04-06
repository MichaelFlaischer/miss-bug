const { useState, useEffect } = React

import { bugService } from '../services/bug.service.front-side.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { authService } from '../services/auth.service.js'

export function BugIndex() {
  const loggedinUser = authService.getLoggedinUser()

  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
  const [pageIdx, setPageIdx] = useState(0)
  const [lables, setLables] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const PAGE_SIZE = 5

  useEffect(() => {
    loadBugs()
  }, [filterBy, pageIdx])

  useEffect(() => {
    loadLables()
  }, [])

  function loadBugs() {
    const queryOptions = {
      ...filterBy,
      pageIdx,
      pageSize: PAGE_SIZE,
    }

    bugService
      .query(queryOptions)
      .then(({ bugs, totalPages }) => {
        setBugs(bugs)
        setTotalPages(totalPages)
      })
      .catch((err) => showErrorMsg(`Couldn't load bugs - ${err}`))
  }

  function loadLables() {
    bugService
      .getAvailableLabels()
      .then(setLables)
      .catch((err) => showErrorMsg(`Couldn't load Lables - ${err}`))
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        showSuccessMsg('Bug removed')
        loadBugs()
      })
      .catch((err) => showErrorMsg(`Cannot remove bug`, err))
  }

  function onAddBug() {
    const title = prompt('Bug title?', 'Bug ' + Date.now())
    const description = prompt('Bug description?', 'A new bug detected')
    const severity = +prompt('Bug severity? (1-5)', 3)
    const labels = prompt('Labels (comma separated)?', 'ui,backend')
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean)

    const bug = { title, description, severity, labels }

    bugService
      .save(bug)
      .then(() => {
        showSuccessMsg('Bug added')
        loadBugs()
      })
      .catch((err) => showErrorMsg(`Cannot add bug`, err))
  }

  function onEditBug(bug) {
    const title = prompt('Edit title:', bug.title)
    if (!title) return

    const description = prompt('Edit description:', bug.description)
    const severity = +prompt('Edit severity? (1-5)', bug.severity)
    const labelsStr = prompt('Edit labels (comma separated):', bug.labels.join(', ') || '')
    const labels = labelsStr
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean)

    const bugToSave = {
      _id: bug._id,
      title,
      description,
      severity,
      labels,
    }

    bugService
      .save(bugToSave)
      .then(() => {
        showSuccessMsg('Bug updated')
        loadBugs()
      })
      .catch((err) => showErrorMsg('Cannot update bug', err))
  }

  function onSetFilterBy(filterBy) {
    setFilterBy((prev) => ({ ...prev, ...filterBy }))
    setPageIdx(0)
  }

  function onNextPage() {
    if (pageIdx < totalPages - 1) setPageIdx((prev) => prev + 1)
  }

  function onPrevPage() {
    if (pageIdx > 0) setPageIdx((prev) => prev - 1)
  }

  return (
    <section className='bug-index main-content'>
      <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} availableLabels={lables} />
      <header>
        <h3>Bug List</h3>
        <button onClick={onAddBug}>Add Bug</button>
      </header>

      {bugs && <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />}

      <div className='paging-controls'>
        <button onClick={onPrevPage} disabled={pageIdx === 0}>
          ◀ Prev
        </button>
        <span>
          Page {pageIdx + 1} / {totalPages}
        </span>
        <button onClick={onNextPage} disabled={pageIdx >= totalPages - 1}>
          Next ▶
        </button>
      </div>
    </section>
  )
}
