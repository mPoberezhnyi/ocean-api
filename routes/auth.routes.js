const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

router.post(
	'/register',
	[
		check('email', 'Wrong email').isEmail(),
		check('password', 'Minimum password length 6 characters')
			.isLength({ min: 6 })
	],
	async (req, res) => {

		console.log(req.body)

		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({
					errors: errors.array(),
					message: 'Wrong registration data'
				})
			}

			const { email, password } = req.body

			const candidate = await User.findOne({ email })

			if (candidate) {
				return res.status(400).json({message: 'Such user already exists...'})
			}

			const hashedPassword = await bcrypt.hash(password, 12)

			const user = new User({email, password: hashedPassword})
			
			await user.save()

			console.log('====')

			res.status(201).json({message: 'User created'})

		} catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.post(
	'/login',
	[
		check('email', 'Wrong email').normalizeEmail().isEmail(),
		check('password', 'Wrong password').exists()
	],
	async (req, res) => {

		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({
					errors: errors.array(),
					message: 'Wrong registration data'
				})
			}

			const { email, password } = req.body

			const user = await User.findOne({ email: email })

			if (!user) {
				return res.status(400).json({message: 'User does not exist...'})
			}

			const isMatch = await bcrypt.compare(password, user.password)

			if (!isMatch) {
				return res.status(400).json({message: 'Wrong password...'})
			}

			const token = jwt.sign(
				{ userId: user.id, userEmail: user.email },
				config.get('jwtSecret'),
				{ expiresIn: '1h' }
			)

			res.json({token, userId: user.id, email: user.email})

		} catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

module.exports = router