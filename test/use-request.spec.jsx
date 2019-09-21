import React from 'react'
import sinon from 'sinon'
import axios from 'axios'
import {create, act} from 'react-test-renderer'

import './utils/ignore-comp-update-outside-act-warning'
import {useRequest} from '../src/use-request'
import {RequestProvider, useCachedRequest} from "../src/use-cached-request";

function TestCompWithHook({hook}) {
  const request = hook('/some/cool/api/123')
  const {data, isPending, error} = request
  const res = `${isPending || data || error}`
  return <div data-request={request}>
    {res}
  </div>
}
function TestComp() {
  return <TestCompWithHook hook={useRequest} />
}
function TestCompCached() {
  return <RequestProvider>
    <TestCompWithHook hook={useCachedRequest} />
  </RequestProvider>
}

function getRequest(comp) {
  return comp.root.findByType('div').props['data-request']
}

const waitForIO = async () => {
  return new Promise((res) => {
    setImmediate(() => setTimeout(res, 1))
  })
}

for (let h of ['useRequest','useCachedRequest']) {
  describe(`Test for ${h}`, () => {
    let sandbox
    let _TestCompUT = h === 'useRequest' ? TestComp : TestCompCached
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
        comp = create(<_TestCompUT/>)
      })
      expect(comp.toJSON()).toMatchSnapshot()
    })
    it('should show fetched data', async () => {
      let stub = sandbox.stub(axios, 'get').resolves({data: 'bar'})
      let comp
      act(() => {
        comp = create(<_TestCompUT/>)
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
        comp = create(<_TestCompUT/>)
      })
      await waitForIO()
      expect(getRequest(comp).data).toBe('baz')

      getRequest(comp).refetch()
      await waitForIO()
      expect(getRequest(comp).data).toBe('foo-bar')
      expect(stub.callCount).toBe(2)
    })
  })
}
