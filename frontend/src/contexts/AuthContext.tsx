import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: () => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier s'il y a un token dans le localStorage
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    
    // Vérifier s'il y a des paramètres d'auth dans l'URL (callback de Google)
    const urlParams = new URLSearchParams(window.location.search)
    const authToken = urlParams.get('token')
    const authUser = urlParams.get('user')
    
    if (authToken && authUser) {
      const userData = JSON.parse(decodeURIComponent(authUser))
      setToken(authToken)
      setUser(userData)
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    setIsLoading(false)
  }, [])

  const login = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.location.href = `${backendUrl}/auth/google`
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.location.href = `${backendUrl}/auth/logout`
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
