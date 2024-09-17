import { useRef, useState, useEffect } from 'react'
import defaultConfig from 'tailwindcss/defaultConfig'
import resolveConfig from 'tailwindcss/resolveConfig'

const tailwindConfig = resolveConfig(defaultConfig)

const screens = tailwindConfig?.theme?.screens as any || {}

export const sizes = Object.entries(screens).reduce((results: any) => {
  results[results.name] = parseInt(results.size)
  return results
}, {})


export function useScreens() {
  const [matches, setMatches] = useState({})
  const matchRef = useRef({})

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!('matchMedia' in window)) return undefined
    function track() {
      setTimeout(() => {
        const exec = Object.entries(screens).reduce((results: { [key: string]: boolean } , [name, size]) => {
          const mediaQuery = `(min-width: ${size})`
          results[name] = typeof window !== "undefined" && window.matchMedia(mediaQuery).matches
          return results
        }, {})
        matchRef.current = exec
        JSON.stringify(matchRef.current) !== JSON.stringify(matches) && setMatches(matchRef.current)
      }, 500);
    }

    !Object.keys(matchRef.current).length && track()
    window.addEventListener('resize', track)
    track()
    return () => window.removeEventListener('resize', track)
  }, [])

  return matches
}
