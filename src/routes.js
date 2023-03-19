// Node
import { randomUUID } from 'node:crypto'

// Third party
import { stringify } from 'csv-stringify'
import iconv from 'iconv-lite'

// Local
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'


const database = new Database()
export const routes = [
  {method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body

      if (!title && !description)
        return response.writeHead(400).end(JSON.stringify({ message: 'All fields are mandatory' }))

      const data = {
        id: randomUUID(),
        title, description,
        completed_date: null,
        created: new Date(),
        updated: new Date()
      }

      database.create('tasks', data)
      return response.writeHead(201).end()
    }
  },
  {method: 'GET',
    path: buildRoutePath('/'),
    handler: (request, response) => {
      const { search } = request.query

      const data = JSON.stringify(database.list('tasks', search ? {
        title: search,
        description: search
      } : null))

      return response.end(data)
    }
  },
  {method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params
      const { title, description } = request.body

      if (!title && !description)
        return response.writeHead(400).end(JSON.stringify({ message: 'Need to send at least one field' }))

      const data = JSON.stringify(database.update('tasks', id, { title, description }))
      if (data !== undefined) {
        return response.writeHead(404).end(JSON.stringify(JSON.parse(data).error))
      } else {
        return response.writeHead(200).end(JSON.stringify('Updated successfully'))
      }
    }
  },
  {method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params

      const data = JSON.stringify(database.delete('tasks', id))
      if (data !== undefined) {
        return response.writeHead(404).end(JSON.stringify(JSON.parse(data).error))
      } else {
        return response.writeHead(204).end()
      }
    }
  },
  {method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params

      const data = JSON.stringify(database.statusTask('tasks', id))
      if (data !== undefined) {
        return response.writeHead(404).end(JSON.stringify(JSON.parse(data).error))
      } else {
        return response.writeHead(200).end()
      }
    }
  },
  {method: 'GET',
    path: buildRoutePath('/tasks/report'),
    handler: async (request, response) => {
      const { search } = request.query
      const data = database.list('tasks', search ? {
        title: search,
        description: search
      } : null)

      try {
        const fields = ['title', 'description', 'completed_date', 'created', 'updated']
        const csvData = await new Promise((resolve, reject) => {
          stringify(data, { header: true, columns: fields, delimiter: ';' }, (err, output) => {
            if (err) reject(err)
            else resolve(output)
          })
        })

        response.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=data.csv'
        })

        const csvUtf8 = iconv.encode(csvData, 'utf-8')
        response.end(csvUtf8)
      } catch (err) {
        return response.writeHead(500).end()
      }
    }
  },
]