import { RequestPromise } from 'request-promise-native'

export async function latency (fn: (...args: any) => RequestPromise<any[]>, ...args: any) {
  const start = Date.now()
  console.log(`running ${fn.name} with args ${args}`)
  try {
    const result = await fn(...args)
    const latency = Date.now() - start
    return { latency, success: !!result.length }
  } catch (err) {
    console.log('An exception occurred:')
    console.log(err)
    return {
      success: false,
      latency: Date.now() - start,
      error: err
    }
  }
}
