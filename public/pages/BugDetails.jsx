const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.front-side.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {
  const [bug, setBug] = useState(null)
  const { bugId } = useParams()

  useEffect(() => {
    bugService
      .getById(bugId)
      .then(setBug)
      .catch((err) => {
        console.error('Cannot load bug:', err)
        showErrorMsg('Cannot load bug')
      })
  }, [])

  function handleDownloadPDF() {
    bugService.getPDFById(bugId)
  }

  if (!bug) return <p className='loading'>Loading bug details...</p>

  return (
    <div className='bug-details'>
      <h3>🐞 Bug Details</h3>

      <div className='bug-info'>
        <h4>🔹 {bug.title}</h4>

        <p>
          <strong>Description:</strong> {bug.description}
        </p>
        <p>
          <strong>Severity:</strong> {bug.severity}
        </p>
        <p>
          <strong>Created At:</strong> {new Date(bug.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Labels:</strong> {bug.labels.length ? bug.labels.join(', ') : 'No labels'}
        </p>
        {bug.creator.fullname && (
          <p>
            <strong>Created By:</strong> {bug.creator.fullname}
          </p>
        )}
      </div>

      <button onClick={handleDownloadPDF}>📄 Save Bug PDF</button>

      <hr />
      <Link to='/bug'>⬅ Back to Bug List</Link>
    </div>
  )
}
