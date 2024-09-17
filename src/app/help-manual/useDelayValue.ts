import { useEffect, useState } from 'react'

const useDelayValue = (inputValue: string, delay: number) => {
  const [delayValue, setDelayValue] = useState(inputValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDelayValue(inputValue)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [inputValue, delay])

  return [delayValue, setDelayValue] as const
}

export default useDelayValue
