import { latency } from './lib/latency'
import { hostStats } from './lib/host'
import { Dependency } from './lib/dependency'
import { RequestPromise } from 'request-promise-native'

export class HealthZ {
  private deps: Array<Dependency> = []
  public status: number = 200

  registerDep (name: string, fn: (...args: any) => RequestPromise<any[]>, ...args: any) {
    this.deps.push(new Dependency(name, fn, args))
  }

  async getHealth (): Promise<any> {
    const health = {} as any
    health.host = hostStats()

    for (const dep of this.deps) {
      const d = await latency(dep.fn, ...dep.args)
      if (d.success !== true) {
        this.status = 500
      }
      health[dep.name] = d
    }

    return health
  }
}
