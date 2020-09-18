import { RequestPromise } from 'request-promise-native'

export class Dependency {
  public name: string
  public fn: (...args: any) => RequestPromise<any[]>
  public args: Array<any>

  constructor (name: string, f: (...args: any) => RequestPromise<any[]>, args: Array<any>) {
    this.name = name
    this.fn = f
    this.args = args
  }
}
