# HealthZ
library for generating standard health check endpoints which return useful stats including host stats and reports of downstream dependencies.

## Installation
to install this library, run `npm install @gopuff/healthz`

## Usage
import the HealthZ object and instantiate a new instance
```js
const { HealthZ } = require('@@gopuff/healthz')
const hz = new HealthZ()
```

Register dependencies by providing a name of the dependency, the function to perform, and the arguments of that function

**_Example with a raw function_**
```ts
import * as rpn from 'request-promise-native'
import * as https from 'https'

const agent = new https.Agent({ keepAlive: true })
const rp = rpn.defaults({ agent })
hz.registerDep('lorem', rp, 'https://jsonplaceholder.typicode.com/todos/1')
```

**_Example with an object function that uses the this context_**
```ts
// Psuedo azure cosmos client object
import { CosmosService } from '../lib/cosmos'
const cosmos = new CosmosService('connection_string', 'collection', 'container')

// Register the dependency with HealthZ
hz.registerDep(
  'cosmos-mycontainer', 
  (query: string) => cosmos.query(query), // need to pass as anonymous or we'll lose this binding
  'Select * from c where c.partitionKey = "my_patition_key"'
)
```

Generate the health stats to return to the caller
```ts
const health = await hz.getHealth()
res.status(hz.status).json(health)
```

This will return a response object with the status set to 200 if all dependencies are successful and 500 if any are unsuccessful. The object looks like this:
```json
{
  "host": {
    "memoryUsageMB": 40.86183547973633,
    "cpuTime": {
      "user": 327468000,
      "system": 26531000
    },
    "platform": "win32",
    "version": "v12.18.0",
    "uptime": 11230.1285054
  },
  "dependencies": {
    "cosmos": {
      "latency": 52,
      "success": true
    },
    "lorem": {
      "latency": 3,
      "success": true
    }
  }
}
```

If a dependency is unsuccessful, an error is included in the object like so:
```json
{
  "host": {
    "memoryUsageMB": 40.86183547973633,
    "cpuTime": {
      "user": 327468000,
      "system": 26531000
    },
    "platform": "win32",
    "version": "v12.18.0",
    "uptime": 11230.1285054
  },
  "dependencies": {
    "cosmos": {
      "latency": 52,
      "success": true
    },
    "error-endpoint": {
      "success": false,
      "latency": 78,
      "error": {
        "name": "StatusCodeError",
        "statusCode": 404,
        "message": "404 - \"{}\"",
        "error": "{}",
        "options": {
          ...
        },
        "response": {
          "statusCode": 404,
          "body": "{}",
          "headers": {
            ...
          },
          "request": {
            ...
          },
          "method": "GET",
          "headers": {}
        }
      }
    }
  }
}
```

## Examples
In an express app, we can add a route to `/healthcheck` with the following controller:

### Simple request
It can be useful to chain these if you have multiple services that use the healthz library since the lib will set the status to a 500 if any dependencies are unsuccessful. This way, we can deduce if the service in question is unhealthy or if it is a downstream dependency. This isn't required as any simple request can be used as well which we can do like this:
```ts
// Express
import { Router, Request, Response, NextFunction } from 'express'
const router = Router()

// Request client
import * as rpn from 'request-promise-native'
import * as https from 'https'
const agent = new https.Agent({ keepAlive: true })
const rp = rpn.defaults({ agent })

// HealthZ lib
const { HealthZ } = require('@gopuff/healthz')
const hz = new HealthZ()

// Register our service endpoint
hz.registerDep(
  'myservice', 
  rp, 
  'https://myservice.mydomain.com/healthcheck' // uses the healthz lib
)

// Endpoint
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await hz.getHealth()
    res.status(hz.status).json(health)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export const HealthCheckController: Router = router
```

### Client object that uses `this`
```ts
// Express
import { Router, Request, Response, NextFunction } from 'express'
const router = Router()

// Psuedo Cosmos client
import { CosmosService } from '../lib/cosmos'
const cosmos = new CosmosService('connection_string', 'collection', 'container')

// Instantiate HealthZ and register our Cosmos client
const { HealthZ } = require('@gopuff/healthz')
const hz = new HealthZ()

// Register our Cosmos client
hz.registerDep(
  'cosmos', 
  (query: string) => cosmos.query(query), 
  'Select * from c where c.partitionKey = "my_partition_key"'
)

// Endpoint
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await hz.getHealth()
    res.status(hz.status).json(health)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export const HealthCheckController: Router = router
```
