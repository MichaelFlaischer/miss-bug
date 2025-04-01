const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { bugService } from '../services/bug.service.front-side.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { BugList } from './BugList.jsx'

export function UserBugs({ userId }) {
  const [bugs, setBugs] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [pageIdx, setPageIdx] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) return
    loadUserBugs()
  }, [userId, pageIdx])

  function loadUserBugs() {
    bugService
      .query()
      .then((res) => {
        const allBugs = res.bugs || res
        console.log(allBugs)
        console.log(userId)

        const userBugs = allBugs.filter((bug) => bug.creator._id === userId)

        const pageSize = 5
        const start = pageIdx * pageSize
        const end = start + pageSize

        setBugs(userBugs.slice(start, end))
        setTotalPages(Math.ceil(userBugs.length / pageSize))
      })
      .catch((err) => {
        console.error('Failed to load user bugs:', err)
        showErrorMsg('Failed to load bugs')
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        setBugs((prevBugs) => prevBugs.filter((bug) => bug._id !== bugId))
        showSuccessMsg('Bug removed successfully')
      })
      .catch((err) => {
        console.error('Failed to remove bug:', err)
        showErrorMsg('Problem removing bug')
      })
  }

  function onEditBug(bug) {
    bug.title = prompt('New title?', bug.title)
    if (!bug.title) return

    bugService
      .save(bug)
      .then((updatedBug) => {
        setBugs((prevBugs) => prevBugs.map((b) => (b._id === updatedBug._id ? updatedBug : b)))
        showSuccessMsg('Bug updated')
        navigate(`/bug/${bug._id}`)
      })
      .catch((err) => {
        console.error('Failed to update bug:', err)
        showErrorMsg('Problem updating bug')
      })
  }

  function onNextPage() {
    if (pageIdx < totalPages - 1) setPageIdx((prev) => prev + 1)
  }

  function onPrevPage() {
    if (pageIdx > 0) setPageIdx((prev) => prev - 1)
  }

  if (!bugs) return <div>Loading bugs...</div>
  if (!bugs.length) return <div>This user has no bugs.</div>

  return (
    <section className='user-bugs'>
      <h3>🐞 Bugs created by user</h3>
      <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />

      <div className='pagination'>
        <button disabled={pageIdx === 0} onClick={onPrevPage}>
          ⬅ Prev
        </button>
        <span>
          Page {pageIdx + 1} of {totalPages}
        </span>
        <button disabled={pageIdx >= totalPages - 1} onClick={onNextPage}>
          Next ➡
        </button>
      </div>
    </section>
  )
}
