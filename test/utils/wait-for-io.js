
export async function waitForIO() {
  return new Promise((res) => {
    setImmediate(() => setTimeout(res, 2))
  })
}
