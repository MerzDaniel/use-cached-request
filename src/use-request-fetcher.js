import React from "react";

const pendingCache = {}

export function useRequestFetcher(url, requests, setRequests, httpClient) {
  React.useEffect(() => {
    if (
      pendingCache[url]
      || (requests.data[url] && !(requests.states[url] && requests.states[url].refetch))
    ) {
      // already pending or loaded
      return
    }

    pendingCache[url] = true
    setRequests({
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
        setRequests({
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
      setRequests({
        data: {...requests.data},
        states: {
          ...requests.states,
          [url]: {pending: false, error: e},
        },
      })
    })
  }, [url, requests.states[url]])

  function refetch() {
    setRequests({
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