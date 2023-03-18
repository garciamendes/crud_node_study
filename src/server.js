import http from 'node:http'

const server = http.createServer((request, response) => {
  const { method, url } = request

  if (method === 'GET' && url === '/')
    return response.end('hello')
})

server.listen(3435)