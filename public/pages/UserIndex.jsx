const { useEffect, useState } = React
import { userService } from '../services/user.service.js'
import { bugService } from '../services/bug.service.front-side.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserIndex() {
  const [users, setUsers] = useState(null)
  const [usersWithBugs, setUsersWithBugs] = useState({})

  useEffect(() => {
    loadUsersAndBugs()
  }, [])

  function loadUsersAndBugs() {
    userService
      .query()
      .then((loadedUsers) => {
        setUsers(loadedUsers)

        const bugFlags = {}

        const bugPromises = loadedUsers.map((user) =>
          bugService.getBugsByUser(user._id).then((bugs) => {
            if (bugs.length > 0) {
              bugFlags[user._id] = true
            }
          })
        )

        Promise.all(bugPromises)
          .then(() => {
            setUsersWithBugs(bugFlags)
          })
          .catch((err) => {
            console.error('Error loading bugs per user:', err)
            showErrorMsg('Failed to load bugs')
          })
      })
      .catch((err) => {
        console.error('Failed to load users:', err)
        showErrorMsg('Failed to load users')
      })
  }

  function onRemoveUser(userId) {
    userService
      .remove(userId)
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId))
        showSuccessMsg('User removed')
      })
      .catch((err) => {
        console.error('Failed to remove user:', err)
        showErrorMsg('Problem removing user')
      })
  }

  if (!users) return <div>Loading users...</div>

  return (
    <section className='user-index'>
      <h2>👥 Users</h2>
      <table>
        <thead>
          <tr>
            <th>User id</th>
            <th>Full Name</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.fullname}</td>
              <td>{user.isAdmin ? '✔️' : '❌'}</td>
              <td>
                {!usersWithBugs[user._id] ? (
                  <button onClick={() => onRemoveUser(user._id)}>🗑 Remove</button>
                ) : (
                  <span style={{ color: 'gray' }}>❌ Has Bugs</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
