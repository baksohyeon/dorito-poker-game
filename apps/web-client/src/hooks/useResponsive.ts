import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setScreenSize, setSidebarOpen, setChatOpen } from '../store/slices/uiSlice'
import { AppDispatch } from '../store'

export const useResponsive = () => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      
      let screenSize: 'mobile' | 'tablet' | 'desktop'
      
      if (width < 768) {
        screenSize = 'mobile'
      } else if (width < 1024) {
        screenSize = 'tablet'
      } else {
        screenSize = 'desktop'
      }
      
      dispatch(setScreenSize(screenSize))
      
      // Auto-adjust sidebar and chat based on screen size
      if (screenSize === 'mobile') {
        dispatch(setSidebarOpen(false))
        dispatch(setChatOpen(false))
      } else if (screenSize === 'tablet') {
        dispatch(setSidebarOpen(false))
        dispatch(setChatOpen(true))
      } else {
        dispatch(setSidebarOpen(true))
        dispatch(setChatOpen(true))
      }
    }

    // Initial check
    updateScreenSize()

    // Add event listener
    window.addEventListener('resize', updateScreenSize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateScreenSize)
    }
  }, [dispatch])
}

// Additional responsive utilities
export const useBreakpoint = () => {
  const getBreakpoint = (): 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
    const width = window.innerWidth
    
    if (width < 640) return 'sm'
    if (width < 768) return 'md'
    if (width < 1024) return 'lg'
    if (width < 1280) return 'xl'
    return '2xl'
  }

  return getBreakpoint()
}

export const useMediaQuery = (query: string): boolean => {
  const getMatches = (query: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  }

  const [matches, setMatches] = useState<boolean>(getMatches(query))

  useEffect(() => {
    const matchMedia = window.matchMedia(query)
    
    const handleChange = () => {
      setMatches(getMatches(query))
    }

    // Modern browsers
    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      matchMedia.addListener(handleChange)
    }

    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', handleChange)
      } else {
        matchMedia.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}

// React import needed for useState
import { useState } from 'react'