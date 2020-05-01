const {Router} = require('express')
const {Types} = require('mongoose')
const {check} = require('express-validator')
const authenticateJWT = require('../middlewares/jwt_auth')
const Product = require('../models/Product')
const User = require('../models/User')
const router = Router()

router.post(
	'/products',
	[
		check('name', 'Empty product name').exists()
	],
	async (req, res) => {

		try {
			const {
				name,
				gallery = [],
				categories = [],
				price = {
					regular: 0,
					sale: 0
				},
				description = "",
				availableSizes = [] } = req.body

			let categoriesList = categories

			if (categoriesList.length) {
				categoriesList = categories.map(item => new Types.ObjectId(item))
			}

			const newProduct = new Product({
				name,
				gallery,
				categories: categoriesList,
				price,
				description,
				availableSizes})

			await newProduct.save()

			res.status(201).json({message: 'Product created'})
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}

	}
)

router.get(
	'/products',
	async (req, res) => {

		try {
			const products = await Product.find({})

			res.status(201).json(products)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}

	}
)

router.get(
	'/products/:id',
	async (req, res) => {

		try {

			const { id } = req.params

			const product = await Product.findOne({ _id: new Types.ObjectId(id) })

			res.status(201).json(product)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}

	}
)

router.post(
	'/favorites',
	authenticateJWT,
	async (req, res) => {
		try {

			const { userId } = req.user
			const productId = req.body.id
			const userObjectId = new Types.ObjectId(userId)

			const user = await User.findOne({ _id: userObjectId})

			if (!user) {
				return res.status(401).json({message: 'User not found'})
			}

			if (!user.favorites.includes(productId)) {
				await User.updateOne(
					{ _id: userObjectId },
					{ favorites: [...user.favorites, new Types.ObjectId(productId)] }
				);
			}

			const { favorites } = await User.findOne({ _id: new Types.ObjectId(userId)})

			const products = await Product.find({_id: favorites.map(item => new Types.ObjectId(item))})

			return res.status(201).json([...products])

		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.get(
	'/favorites',
	authenticateJWT,
	async (req, res) => {
		try {

			const { userId } = req.user

			const { favorites } = await User.findOne({ _id: new Types.ObjectId(userId)})

			const products = await Product.find({_id: favorites.map(item => new Types.ObjectId(item))})

			return res.status(201).json([...products])
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.patch(
	'/favorites',
	authenticateJWT,
	async (req, res) => {
		try {

			const { userId } = req.user
			const productId = req.body.id
			const userObjectId = new Types.ObjectId(userId)

			const user = await User.findOne({ _id: userObjectId})

			if (!user) {
				return res.status(401).json({message: 'User not found'})
			}

			const index = user.favorites.findIndex(item => item == productId)

			if (index !== -1) {
				await User.updateOne(
					{
						_id: userObjectId
					},
					{
						favorites: [
						...user.favorites.slice(0, index),
						...user.favorites.slice(index+1)
						]
					}
				);
			}

			const { favorites } = await User.findOne({ _id: new Types.ObjectId(userId)})

			const products = await Product.find({_id: favorites.map(item => new Types.ObjectId(item))})

			return res.status(201).json([...products])

		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

module.exports = router