const express = require('express')
const config = require('config')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors());

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/', require('./routes/category.routes'))
app.use('/api/', require('./routes/products.routes'))

const PORT = config.get('port') || 5000

const start = async () => {

	try {
		await mongoose.connect(config.get('mongoUri'), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})
		app.listen(PORT, () => { console.log(`App has been started on port ${PORT}`) })
	} catch (e) {
		console.log('Server error ', e.message)
		process.exit(1)
	}
}

start()

