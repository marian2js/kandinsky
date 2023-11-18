import { useEffect, useState } from 'react'

type apiCallParam<T> = (signal: AbortSignal) => Promise<T>

type useApiHookReturnValue<T> = {
  isLoading: boolean
  data?: T
}

export default function useApi<T>(apiCall: apiCallParam<T>, pollingTime?: number): useApiHookReturnValue<T> {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [data, setData] = useState<T>()

  useEffect(() => {
    const abortController = new AbortController()

    async function performApiCall() {
      try {
        setIsLoading(true)
        const data = await apiCall(abortController.signal)
        setData(data)
      } catch (exception) {
        setData(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    let intervalId: NodeJS.Timer

    if (pollingTime) {
      intervalId = setInterval(() => {
        performApiCall()
      }, pollingTime)
    }

    performApiCall()

    return () => {
      abortController.abort()
      clearInterval(intervalId.toString())
    }
  }, [apiCall, pollingTime])

  return {
    isLoading,
    data,
  }
}
