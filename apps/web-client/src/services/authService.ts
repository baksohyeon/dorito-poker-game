// Mock authentication service for development
interface LoginCredentials {
  email: string
  password: string
}

interface User {
  id: string
  username: string
  email: string
  chips: number
}

interface LoginResponse {
  user: User
  token: string
}

// Mock user database
const mockUsers = [
  {
    id: '1',
    username: 'demo_player',
    email: 'demo@PokerDoritos.com',
    password: 'demo123',
    chips: 10000
  },
  {
    id: '2',
    username: 'test_user',
    email: 'test@example.com',
    password: 'test123',
    chips: 5000
  }
]

class AuthService {
  private isAuthenticated = false
  private currentUser: User | null = null
  private authToken: string | null = null

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Find user in mock database
    const user = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    )

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Generate mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Set authentication state
    this.isAuthenticated = true
    this.currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      chips: user.chips
    }
    this.authToken = token

    // Store in localStorage for persistence
    localStorage.setItem('poker_token', token)
    localStorage.setItem('poker_user', JSON.stringify(this.currentUser))

    return {
      user: this.currentUser,
      token
    }
  }

  async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Clear authentication state
    this.isAuthenticated = false
    this.currentUser = null
    this.authToken = null

    // Clear localStorage
    localStorage.removeItem('poker_token')
    localStorage.removeItem('poker_user')
  }

  async refreshToken(): Promise<LoginResponse | null> {
    const token = localStorage.getItem('poker_token')
    const userStr = localStorage.getItem('poker_user')

    if (!token || !userStr) {
      return null
    }

    try {
      const user = JSON.parse(userStr)

      // In a real app, validate the token with the server
      // For now, just restore the session
      this.isAuthenticated = true
      this.currentUser = user
      this.authToken = token

      return {
        user,
        token
      }
    } catch (error) {
      // Invalid stored data
      this.logout()
      return null
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getToken(): string | null {
    return this.authToken
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated
  }

  // Initialize auth state from localStorage
  initializeAuth(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const result = await this.refreshToken()
        resolve(result !== null)
      } catch (error) {
        resolve(false)
      }
    })
  }

  // Mock API call for registration
  async register(userData: {
    username: string
    email: string
    password: string
  }): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      chips: 1000 // Starting chips
    }

    // Add to mock database
    mockUsers.push(newUser)

    // Generate mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Set authentication state
    this.isAuthenticated = true
    this.currentUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      chips: newUser.chips
    }
    this.authToken = token

    // Store in localStorage
    localStorage.setItem('poker_token', token)
    localStorage.setItem('poker_user', JSON.stringify(this.currentUser))

    return {
      user: this.currentUser,
      token
    }
  }

  // Get available demo accounts
  getDemoAccounts() {
    return [
      {
        email: 'demo@PokerDoritos.com',
        password: 'demo123',
        username: 'Demo Player'
      },
      {
        email: 'test@example.com',
        password: 'test123',
        username: 'Test User'
      }
    ]
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
