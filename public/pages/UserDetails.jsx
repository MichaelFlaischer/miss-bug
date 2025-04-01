const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { UserBugs } from '../cmps/UserBugs.jsx'

export function UserDetails() {
  const [user, setUser] = useState(null)
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
  }, [params.userId])

  function loadUser() {
    userService
      .getById(params.userId)
      .then(setUser)
      .catch((err) => {
        console.log('err:', err)
        navigate('/')
      })
  }

  function onBack() {
    navigate('/')
  }

  if (!user) return <div>Loading...</div>

  return (
    <section className='user-details'>
      <h1>User {user.fullname}</h1>

      <pre>{JSON.stringify(user, null, 2)}</pre>
      <hr />
      <UserBugs userId={user._id} />
      <button onClick={onBack}>Back</button>
    </section>
  )
}
