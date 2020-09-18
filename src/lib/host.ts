export function hostStats () {
  return {
    memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
    cpuTime: process.cpuUsage(),
    platform: process.platform,
    version: process.version,
    uptime: process.uptime()
  }
}
