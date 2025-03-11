import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import Person from './models/person.js'
import { PORT } from './config.js'

const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', async (request, response, next) => {
  try {
    const numberOfPersons = await Person.countDocuments()
    const date = new Date()
    const formattedDate = date.toLocaleString('en-US', {
      timeZone: 'Europe/Kiev',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    response.send(`
      <p>PhoneBook has info for ${numberOfPersons} people</p>
      <p>${formattedDate} (Eastern European Standard Time)</p>
    `)
  } catch (error) {
    next(error)
  }
})

app.get('/api/persons/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    const person = await Person.findById(id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).send({ error: 'Person not found' })
    }
  } catch (error) {
    next(error)
  }
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
      console.log(result)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  Person.findOne({ name })
    .then((existingPerson) => {
      if (existingPerson) {
        existingPerson.number = number
        return existingPerson.save()
      } else {
        const person = new Person({ name, number })
        return person.save()
      }
    })
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  const { name, number } = request.body

  const updatedPerson = {
    name,
    number,
  }

  Person.findByIdAndUpdate(id, updatedPerson, { new: true, runValidators: true, context: 'query' })
    .then((updated) => {
      if (updated) {
        response.json(updated)
      } else {
        response.status(404).send({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformated id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
