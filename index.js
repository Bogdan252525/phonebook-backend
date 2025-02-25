import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(express.static('dist'))
app.use(cors())
app.use(express.json());

let persons = [
	{ 
		"id": "1",
		"name": "Arto Hellas", 
		"number": "040-123456"
	},
	{ 
		"id": "2",
		"name": "Ada Lovelace", 
		"number": "39-44-5323523"
	},
	{ 
		"id": "3",
		"name": "Dan Abramov", 
		"number": "12-43-234345"
	},
	{ 
		"id": "4",
		"name": "Mary Poppendieck", 
		"number": "39-23-6423122"
	}
]

const options = { 
  timeZone: 'Europe/Kiev', 
  weekday: 'short', 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit', 
  timeZoneName: 'short',
}

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status - :response-time ms :body'));

app.get('/api/persons', (request, response) => {
	response.send(persons)
})

app.get('/info', (request, response) => {
	const numberOfPersons = persons.length
	const date = new Date();
	const formattedDate = date.toLocaleString('en-US', options);
	response.send(`
		<p>Phonebook has info for ${numberOfPersons} people</p>
		<p>${formattedDate} (Eastern European Standard Time)</p>
	`)
})

app.get('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	const person = persons.find(person => person.id === id);
	response.json(person);
})

app.delete('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	persons = persons.filter(person => person.id !== id);

	response.status(204).end();
})

app.post('/api/persons', (request, response) => {
	const body = request.body;

	if (!body.name) {
		return response.status(400).json({
			error: 'name missing'
		})
	}
	if (!body.number) {
		return response.status(400).json({
			error: 'number missing'
		})
	}

	const nameExists = persons.some(person => person.name === body.name);

	if (nameExists) {
		return response.status(400).json({
			error: 'name must be unique'
		})
	}

	const person = {
		id: (Math.floor(Math.random() * (999999 - 1 + 1)) + 1).toString(),
		name: body.name,
		number: body.number,
	}

	persons = persons.concat(person)

	response.json(person)
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
})
