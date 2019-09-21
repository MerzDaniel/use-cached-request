import {RequestProvider, useCachedRequest} from "../src/use-cached-request";
import React from "react";
import sinon from "sinon";
import axios from "axios";
import {act, create} from "react-test-renderer";
import {waitForIO} from "./utils/wait-for-io";
import './utils/ignore-comp-update-outside-act-warning'

function TestComp({urls = ['/api', '/api']}) {
  function TestCompWithHook({url}) {
    const request = useCachedRequest(url)
    const {data, isPending, error} = request
    const res = `${isPending || data || error}`
    return <div data-request={request}>
      {res}
    </div>
  }

  return <RequestProvider>
    {
      (urls).map((u, i) => (<TestCompWithHook key={i} url={u}/>))
    }
  </RequestProvider>
}

describe('Caching', () => {
  let sandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })
  it('should fetch data only once', async () => {
    let stub = sandbox.stub(axios, 'get').resolves({data: 'foo-bar-baz'})
    let comp
    act(() => {
      comp = create(<TestComp/>)
    })
    await waitForIO()
    expect(stub.callCount).toBe(1)
    expect(comp.toJSON()).toMatchSnapshot()
  })
})
