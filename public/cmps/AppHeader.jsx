const { Link, NavLink } = ReactRouterDOM
const { useNavigate } = ReactRouter

import { authService } from '../services/auth.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader({ loggedinUser, setLoggedinUser }) {
  const navigate = useNavigate()

  function onLogout() {
    authService
      .logout()
      .then(() => {
        setLoggedinUser(null)
        navigate('/auth')
      })
      .catch((err) => {
        console.log(err)
        showErrorMsg(`Couldn't logout`)
      })
  }

  return (
    <header className='app-header main-content single-row'>
      <h1>Miss Bug</h1>

      <nav>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/bug'>Bugs</NavLink>
        <NavLink to='/about'>About</NavLink>

        {loggedinUser && loggedinUser.isAdmin && <NavLink to='/user'>Users</NavLink>}

        {!loggedinUser ? (
          <NavLink to='/auth'>Login</NavLink>
        ) : (
          <div className='user'>
            <NavLink to={`/user/${loggedinUser._id}`}>{loggedinUser.fullname}</NavLink>
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
      </nav>
    </header>
  )
}
