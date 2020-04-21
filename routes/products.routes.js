const {Router} = require('express')
const {Types} = require('mongoose')
const {check} = require('express-validator')
const Product = require('../models/Product')
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

module.exports = router