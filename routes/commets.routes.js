const {Router} = require('express')
const {Types} = require('mongoose')
const Product = require('../models/Product')
const Comment = require('../models/Comment')
const router = Router()

router.post(
	'/comments',
	async (req, res) => {
		try {

			const {userId, name, text, parentId, productId} = req.body

			const parent = parentId === 0 ?
				new Types.ObjectId(productId) :
				new Types.ObjectId(parentId)

			const user = userId === 0 ?
				new Types.ObjectId(productId) :
				new Types.ObjectId(userId)

			const comment = new Comment({
				userId: user,
				name,
				text,
				parentId: parent,
				productId: new Types.ObjectId(productId),
				date: new Date(),
				modifiedDate: 0
			})
			await comment.save()

			const comments = await Comment.find({productId: new Types.ObjectId(productId)})

			res.status(201).json(comments)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.get(
	'/comments/:id',
	async (req, res) => {
		try {
			const { id } = req.params

			const objectId = new Types.ObjectId(id)

			const comments = await Comment.find({productId: objectId})

			res.status(201).json(comments)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.put(
	'/comments/',
	async (req, res) => {
		try {

			const {_id, text, productId} = req.body.comment

			await Comment.updateOne(
				{ _id: new Types.ObjectId(_id) },
				{ text, modifiedDate: new Date() }
			)

			const comments = await Comment.find({productId: new Types.ObjectId(productId)})

			res.status(201).json(comments)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.delete(
	'/comments/:id',
	async (req, res) => {
		try {

			const { id } = req.params

			const {productId} = await Comment.findOne({_id: new Types.ObjectId(id)})

			await Comment.deleteOne({_id: new Types.ObjectId(id)})

			const comments = await Comment.find({productId})

			res.status(201).json(comments)

		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

module.exports = router