export async function latency (fn: (...args: any) => Promise<any[]>, ...args: any) {
  const start = Date.now()
  try {
    const result = await fn(...args)
    const latency = Date.now() - start
    return { latency, success: !!result.length }
  } catch (err) {
    return {
      success: false,
      latency: Date.now() - start,
      error: err
    }
  }
}
