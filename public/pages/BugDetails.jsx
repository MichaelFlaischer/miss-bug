const { useState, useEffect, useRef } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.front-side.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {
  const [bug, setBug] = useState(null)
  const { bugId } = useParams()

  useEffect(() => {
    bugService
      .getById(bugId)
      .then((bug) => setBug(bug))
      .catch((err) => {
        console.log(err)
        showErrorMsg(`Cannot load bug`, err)
      })
  }, [])

  function handleDownloadPDF() {
    bugService.getPDFById(bugId)
  }

  return (
    <div className='bug-details'>
      <h3>Bug Details</h3>
      {!bug && <p className='loading'>Loading....</p>}
      {bug && (
        <div>
          <h4>{bug.title}</h4>
          <h5>
            description: <span>{bug.description}</span>
          </h5>
          <h5>
            Severity: <span>{bug.severity}</span>
          </h5>
          <button onClick={() => handleDownloadPDF()}>Save Bug PDF</button>
        </div>
      )}
      <hr />
      <Link to='/bug'>Back to List</Link>
    </div>
  )
}
