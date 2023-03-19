// Node
import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)
export class Database {
  // " # " = private variable
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => { this.#persist() })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  list(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }

  create(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()
    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex !== -1) {
      let row = this.#database[table][rowIndex]

      this.#database[table][rowIndex] = { ...row, updated: new Date(), ...data }
      this.#persist()
    } else {
      return { 'error': 'Task not found' }
    }
  }

  statusTask(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    const date = new Date()

    if (rowIndex !== -1) {
      let row = this.#database[table][rowIndex]

      if (row.completed_date) {
        this.#database[table][rowIndex] = { ...row, updated: date, completed_date: null }
      } else {
        this.#database[table][rowIndex] = { ...row, updated: date, completed_date: date }
      }
      this.#persist()
    } else {
      return { 'error': 'Task not found' }
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex !== -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    } else {
      return { 'error': 'Task not found' }
    }
  }
}