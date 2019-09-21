import React from 'react'
import axios from 'axios'

const httpClient = axios
const pendingCache = {}

const useRequest = (url) => {
  const [requests, setRequestStates] = React.useState({
    states: {},
    data: {},
  })

  React.useEffect(() => {
    // already pending or loaded
    if (
      pendingCache[url]
      || (requests.data[url] && !(requests.states[url] && requests.states[url].refetch))
    ) {
      return
    }

    pendingCache[url] = true
    setRequestStates({
      data: requests.data,
      states: {
        ...requests.states,
        [url]: {
          pending: true,
          refetch: false,
        },
      },
    })

    httpClient.get(url).then(
      ({data: responseData}) => {
        pendingCache[url] = false
        setRequestStates({
          data: {
            ...requests.data,
            [url]: responseData,
          },
          states: {
            ...requests.states,
            [url]: {pending: false},
          },
        })
      },
    ).catch((e) => {
      pendingCache[url] = false
      setRequestStates({
        data: {...requests.data},
        states: {
          ...requests.states,
          [url]: {pending: false, error: e},
        },
      })
    })
  }, [url, requests.states[url]])

  function refetch() {
    setRequestStates({
      data: requests.data,
      states: {
        ...requests.states,
        [url]: {...requests.states[url], refetch: true},
      },
    })
  }

  return {
    error: requests.states[url] ? requests.states[url].error : null,
    isPending: requests.states[url] ? requests.states[url].pending : true,
    data: requests.data[url],
    refetch,
  }
}

export {
  useRequest,
}
