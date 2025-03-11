import mongoose from 'mongoose'

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
};

const password = process.argv[2]

const url =
  `mongodb+srv://admin:${password}@cluster2.mgkno.mongodb.net/Person?retryWrites=true&w=majority&appName=Cluster2`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

if (process.argv.length < 4) {
  Person.find({}).then(result => {
    console.log('phone book:')
    result.forEach(person => {
      console.log(`
				${person.name} ${person.number}
				`)
    })
    mongoose.connection.close()
  })
} else {
  person.save().then(result => {
    console.log(`
			added ${result.name} number ${result.number} to phonebook
			`)
    mongoose.connection.close()
  })
}


