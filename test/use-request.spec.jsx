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

function getHook(comp) {
  return comp.root.findByType('div').props.hook
}

const waitForIO = async () => {
  return new Promise((res) => {
    setImmediate(() => setTimeout(res, 1))
  })
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
  it('should show fetched data', async () => {
    let stub = sandbox.stub(axios, 'get').resolves({data: 'bar'})
    let comp
    act(() => {
      comp = create(<TestComp/>)
    })
    await waitForIO()
    expect(comp.toJSON()).toMatchSnapshot()
    expect(stub.callCount).toBe(1)
  })
  it('should show re-fetch data', async () => {
    let stub = sandbox.stub(axios, 'get')
      .onFirstCall().resolves({data: 'baz'})
      .onSecondCall().resolves({data: 'foo-bar'})

    let comp
    act(() => {
      comp = create(<TestComp/>)
    })
    await waitForIO()
    expect(comp.root.findByType('div').props.hook.data).toBe('baz')

    getHook(comp).refetch()
    await waitForIO()
    expect(getHook(comp).data).toBe('foo-bar')
    expect(stub.callCount).toBe(2)
  })
})
