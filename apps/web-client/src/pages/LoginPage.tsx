import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'

interface LoginForm {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/lobby')
    }
  }, [isAuthenticated, navigate])

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {}

    if (!form.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      dispatch(loginStart())
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        const data = await response.json()
        dispatch(loginSuccess({
          user: data.user,
          token: data.token
        }))
        navigate('/lobby')
      } else {
        const error = await response.json()
        dispatch(loginFailure())
        setErrors({ email: error.message || 'Login failed' })
      }
    } catch (error) {
      dispatch(loginFailure())
      setErrors({ email: 'Network error. Please try again.' })
    }
  }

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleDemoLogin = () => {
    setForm({
      email: 'demo@PokerDoritos.com',
      password: 'demo123'
    })
  }

  return (
    <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-radial from-poker-dark-800 to-poker-dark-900 opacity-50"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-poker-accent-400 to-poker-accent-600 rounded-2xl flex items-center justify-center shadow-glow">
            <span className="text-2xl font-bold text-white">♠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to PokerDoritos</h1>
          <p className="text-poker-dark-400">Sign in to start playing</p>
        </div>

        {/* Login Form */}
        <div className="bg-poker-dark-800 rounded-xl p-8 shadow-table border border-poker-dark-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-poker-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleInputChange('email')}
                  className={`form-input w-full px-4 py-3 rounded-lg bg-poker-dark-700 border text-white placeholder-poker-dark-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500 transition-colors ${
                    errors.email ? 'border-poker-red-500' : 'border-poker-dark-600'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-poker-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-poker-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-poker-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={form.password}
                  onChange={handleInputChange('password')}
                  className={`form-input w-full px-4 py-3 rounded-lg bg-poker-dark-700 border text-white placeholder-poker-dark-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500 transition-colors ${
                    errors.password ? 'border-poker-red-500' : 'border-poker-dark-600'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-poker-dark-400 hover:text-poker-dark-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-poker-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-poker-accent-500 focus:ring-poker-accent-500 border-poker-dark-600 rounded bg-poker-dark-700"
                />
                <span className="ml-2 text-sm text-poker-dark-300">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-poker-accent-400 hover:text-poker-accent-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-poker w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-poker-accent-500 to-poker-accent-600 hover:from-poker-accent-600 hover:to-poker-accent-700 focus:ring-4 focus:ring-poker-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-medium text-poker-accent-400 bg-poker-dark-700 hover:bg-poker-dark-600 border border-poker-accent-500 hover:border-poker-accent-400 focus:ring-4 focus:ring-poker-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Try Demo Account
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-poker-dark-600"></div>
            <span className="px-4 text-sm text-poker-dark-400">or</span>
            <div className="flex-1 border-t border-poker-dark-600"></div>
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-poker-dark-600 rounded-lg text-sm font-medium text-poker-dark-300 bg-poker-dark-700 hover:bg-poker-dark-600 focus:ring-4 focus:ring-poker-dark-500/50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-poker-dark-600 rounded-lg text-sm font-medium text-poker-dark-300 bg-poker-dark-700 hover:bg-poker-dark-600 focus:ring-4 focus:ring-poker-dark-500/50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              Continue with Twitter
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-poker-dark-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-poker-accent-400 hover:text-poker-accent-300 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-poker-dark-500">
          <p>
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-poker-accent-400 hover:text-poker-accent-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-poker-accent-400 hover:text-poker-accent-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
