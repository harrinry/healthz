/* eslint-env mocha */
import { expect } from 'chai'
import 'mocha'
import { HealthZ } from '../src/index'
import * as rpn from 'request-promise-native'
import * as https from 'https'

describe('Health', () => {
  let rp: any
  let hz: HealthZ

  beforeEach(() => {
    const agent = new https.Agent({ keepAlive: true })
    rp = rpn.defaults({ agent })
    hz = new HealthZ()
    hz.registerDep('lorem', rp, 'https://jsonplaceholder.typicode.com/todos/1')
    hz.registerDep('ipsum', rp, 'https://jsonplaceholder.typicode.com/todos/2')
  })

  it('should return host stats', async () => {
    const res = await hz.getHealth()

    expect(res).to.have.property('host')

    expect(res.host).to.have.property('memoryUsageMB')
    expect(res.host.memoryUsageMB).to.match(/\d+/)

    expect(res.host).to.have.property('cpuTime')
    expect(res.host.cpuTime).to.have.property('user')
    expect(res.host.cpuTime).to.have.property('system')
    expect(res.host.cpuTime.user).to.match(/\d+/)
    expect(res.host.cpuTime.system).to.match(/\d+/)

    expect(res.host).to.have.property('platform')
    expect(res.host.platform).to.match(/\w+/)

    expect(res.host).to.have.property('version')
    expect(res.host.version).to.match(/\d+\.\d+\.\d+/)

    expect(res.host).to.have.property('uptime')
    expect(res.host.uptime).to.match(/\d+\.\d+/)
  })

  it('should return health stats for each dependency', async () => {
    const res = await hz.getHealth()

    expect(res).to.have.property('lorem')

    expect(res.lorem).to.have.property('latency')
    expect(res.lorem.latency).to.match(/\d+/)

    expect(res.lorem).to.have.property('success')
    expect(res.lorem.success).to.equal(true)

    expect(res).to.have.property('ipsum')

    expect(res.ipsum).to.have.property('latency')
    expect(res.ipsum.latency).to.match(/\d+/)

    expect(res.ipsum).to.have.property('success')
    expect(res.ipsum.success).to.equal(true)
  })

  it('should set status to 200 if all dependencies are healthy', async () => {
    await hz.getHealth()
    expect(hz).to.have.property('status')
    expect(hz.status).to.equal(200)
  })

  it('should set status to 500 if any dependencies are unhealthy', async () => {
    hz.registerDep('ipsum', rp, 'https://jsonplaceholder.typicode.com/not/a/real/endpoint')

    await hz.getHealth()
    expect(hz).to.have.property('status')
    expect(hz.status).to.equal(500)
  })
})

// tslint:disable-next-line:no-unused-expression
