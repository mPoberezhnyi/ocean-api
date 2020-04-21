const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
	name: {type: String},
	gallery: [{type: String}],
	categories: [{type: Types.ObjectId, ref: 'Category'}],
	price: {
		regular: {type: Number},
		sale: {type: Number}
	},
	description: {type: String},
	availableSizes: [{type: String}]
})

module.exports = model('Product', schema)