const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
	name: {type: String},
	parentId: {type: Types.ObjectId},
	productId: {type: Types.ObjectId},
	userId: {type: Types.ObjectId, ref: 'User'},
	text: {type: String},
	date: {type: Date},
	modifiedDate: {type: Date}
})

module.exports = model('Comment', schema)