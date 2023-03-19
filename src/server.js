// Node
import http from 'node:http'

// Local
import { json } from './middlewares/json.js'
import { extractQueryParams } from './utils/extract-query-params.js'
import { routes } from './routes.js'

const server = http.createServer(async (request, response) => {
  const { method, url } = request

  await json(request, response)

  const route = routes.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routeParams = request.url.match(route.path)
    const { query, ...params } = routeParams.groups

    request.params = params
    request.query = query ? extractQueryParams(query) : {}
    request.params = { ...routeParams.groups }

    return route.handler(request, response)
  }

  return response.writeHead(404).end()
})

server.listen(3333)