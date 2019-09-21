import React from 'react'
import axios from 'axios'
import {useRequestFetcher} from "./use-request-fetcher";

const httpClient = axios

const useRequest = (url) => {
  const [requests, setRequestStates] = React.useState({
    states: {},
    data: {},
  })

  const {
    refetch, isPending, data, error
  } = useRequestFetcher(url, requests, setRequestStates, httpClient)

  return { refetch, isPending, data, error }
}

export {
  useRequest,
}
