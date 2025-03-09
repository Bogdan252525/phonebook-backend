import mongoose from 'mongoose';
import { MONGODB_URI } from '../config.js';

mongoose.set('strictQuery', false);

const url = MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url, {
	useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true
	},
	number: {
		type: String,
		require: true,
		validate: function (v) {
			return /^\d{2,3}-\d{5,}$/.test(v);
		},
		message: props => `${props.value} is not a valid phone number!`
	},
});

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
});

export default mongoose.model('Person', personSchema);