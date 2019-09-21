import React from 'react'
import axios from 'axios'
import {useRequestFetcher} from "./use-request-fetcher";

const httpClient = axios

const useRequest = (url) => {
  const [requests, setRequestStates] = React.useState({
    states: {},
    data: {},
  })

  useRequestFetcher(url, requests, setRequestStates, httpClient)

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
