const {Router} = require('express')
const {check} = require('express-validator')
const Category = require('../models/Category')
const Product = require('../models/Product')
const router = Router()

router.post(
	'/categories',
	[
		check('categoryName', 'Wrong category name').exists(),
		check('categoryImg', 'Wrong category img').exists()
	],
	async (req, res) => {

		try {
			const {name, img} = req.body

			const oldCategory = await Category.findOne({ name })

			if (oldCategory) {
				return res.status(400).json({message: 'Such category already exists...'})
			}

			const category = new Category({name, img})

			await category.save()

			res.status(201).json({message: 'Category created'})
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}

	}
)

router.get(
	'/categories',
	async (req, res) => {

		try {
			const categories = await Category.find({})

			res.status(201).json(categories)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}

	}
)

router.get(
	'/categories/:name',
	async (req, res) => {

		try {

			const { name } = req.params

			const { _id } = await Category.findOne({name})

			const products = await Product.find({ categories: [_id] })

			res.status(201).json(products)
		}
		catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}

	}
)

module.exports = router