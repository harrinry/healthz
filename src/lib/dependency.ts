export class Dependency {
  public name: string
  public fn: (...args: any) => Promise<any[]>
  public args: Array<any>

  constructor (name: string, f: (...args: any) => Promise<any[]>, args: Array<any>) {
    this.name = name
    this.fn = f
    this.args = args
  }
}
