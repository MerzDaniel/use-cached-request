import React from 'react'
import axios from 'axios'
import * as PropTypes from 'prop-types'
import {useRequestFetcher} from "./use-request-fetcher";

const httpClient = axios
const defaultState = {
  states: {},
  data: {},
}
const requestContext = React.createContext()
const RequestProvider = ({children}) => {
  const [state, setState] = React.useState(defaultState)

  return (
    <requestContext.Provider value={[state, setState]}>
      {children}
    </requestContext.Provider>
  )
}
RequestProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

function useCachedRequest(url) {
  const [requests, setRequestStates] = React.useContext(requestContext) || [undefined, undefined]

  const {
    refetch, isPending, error, data
  } = useRequestFetcher(url, requests, setRequestStates, httpClient)

  return {
    refetch, isPending, error, data
  }
}

export {
  RequestProvider,
  useCachedRequest,
}
