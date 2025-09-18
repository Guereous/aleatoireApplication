import { useAuth } from '../contexts/AuthContext'

export default function LoginButton() {
  const { login, user, logout, isLoading } = useAuth()

  if (isLoading) {
    return <div className="login-loading">Chargement...</div>
  }

  if (user) {
    return (
      <div className="user-info">
        <div className="user-details">
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.name} 
              className="user-avatar"
            />
          )}
          <span className="user-name">{user.name}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          Déconnexion
        </button>
      </div>
    )
  }

  return (
    <button onClick={login} className="login-btn">
      Se connecter avec Google
    </button>
  )
}
