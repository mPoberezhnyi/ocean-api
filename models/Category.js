const { Schema, model } = require('mongoose')

const schema = new Schema({
	name: {type: String},
	img: {type: String}
})

module.exports = model('Category', schema)