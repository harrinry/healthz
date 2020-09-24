export function hostStats () {
  let stats: any
  try {
    stats = {
      memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
      cpuTime: process.cpuUsage(),
      platform: process.platform,
      version: process.version,
      uptime: process.uptime()
    }
  } catch (err) {
    stats = {
      error: err
    }
  }
  return stats
}
