const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'
import { authService } from '../services/auth.service.js'

export function BugList({ bugs, onRemoveBug, onEditBug }) {
  const user = authService.getLoggedinUser()

  function isAllowed(bug) {
    if (!user) return false
    return user.isAdmin || user._id === bug.creator._id
  }

  if (!bugs) return <div>Loading...</div>

  return (
    <ul className='bug-list'>
      {bugs.map((bug) => (
        <li key={bug._id}>
          <BugPreview bug={bug} />

          <section className='actions'>
            <Link to={`/bug/${bug._id}`}>
              <button>Details</button>
            </Link>

            {isAllowed(bug) && <button onClick={() => onEditBug(bug)}>Edit</button>}
            {isAllowed(bug) && <button onClick={() => onRemoveBug(bug._id)}>x</button>}
          </section>
        </li>
      ))}
    </ul>
  )
}
