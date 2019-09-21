import React from 'react'
import sinon from 'sinon'
import axios from 'axios'
import {create, act} from 'react-test-renderer'
import './utils/ignore-comp-update-outside-act-warning'

import {useRequest} from '../src/use-request'

function TestComp() {
  const hook = useRequest('/some/cool/api/123')
  const {data, isPending, error} = hook
  const res = `${isPending || data || error}`
  return <div hook={hook}>
    {res}
  </div>
}

describe('tests', () => {
  let sandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })

  it('should show pending state', () => {
    sandbox.stub(axios, 'get').resolves({data: 'foo'})
    let comp
    act(() => {
      comp = create(<TestComp/>)
    })
    expect(comp.toJSON()).toMatchSnapshot()
  })
  it('should fetch data', (done) => {
    let stub = sandbox.stub(axios, 'get').resolves({data: 'bar'})
    let comp
    act(() => {
      comp = create(<TestComp/>)
    })
    setImmediate(() => {
      // wait for IO
      expect(comp.toJSON()).toMatchSnapshot()
      expect(stub.callCount).toBe(1)
      done()
    })
  })
})
