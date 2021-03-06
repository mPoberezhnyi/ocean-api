const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const authenticateJWT = require('../middlewares/jwt_auth')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

let refreshTokens = [];

router.post(
	'/register',
	[
		check('email', 'Wrong email').isEmail(),
		check('password', 'Minimum password length 6 characters')
			.isLength({ min: 6 })
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

			const { name, email, password } = req.body

			const candidate = await User.findOne({ email })

			if (candidate) {
				return res.status(400).json({message: 'Such user already exists...'})
			}

			const hashedPassword = await bcrypt.hash(password, 12)

			const user = new User({name, email, password: hashedPassword})
			
			await user.save()

			res.status(201).json({message: 'User created', email})

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
				{ name: user.name, userId: user.id, email: user.email },
				config.get('jwtSecret'),
				{ expiresIn: '1h' }
			)

			const refreshToken = jwt.sign(
				{ name: user.name, userId: user.id, email: user.email },
				config.get('refreshTokenSecret')
			)

			refreshTokens.push(refreshToken);

			res.json({
				name: user.name,
				userId: user.id,
				email: user.email,
				token,
				refreshToken
			});

		} catch (e) {
			res.status(500).json({message: 'Something wrong, try again...'})
		}
	}
)

router.get('/profile', authenticateJWT, (req, res) => {
	res.status(201).json({isUser: true});
})

router.get('/userinfo', authenticateJWT, async (req, res) => {

	try {
		const { user } = req

		if (user) {
			return res.status(201).json({
				name: user.name,
				userId: user.id,
				email: user.email,
			})
		}
	}
	catch (e) {
		res.status(401).json({message: 'Error user info'});
	}
})

router.post('/token', async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(401);
		}

		if (!refreshTokens.includes(token)) {
			return res.status(403);
		}

		jwt.verify(token, config.get('refreshTokenSecret'), (err, user) => {
			if (err) {
				return res.status(403);
			}

			const token = jwt.sign(
				{ userId: user.id, email: user.email, name: user.name },
				config.get('jwtSecret'),
				{ expiresIn: '1h' });

			res.json({
				token
			});
		});
	}
	catch (e) {
		res.status(403).json({message: "Token error"})
	}

});

router.post('/logout', (req, res) => {
	const { token } = req.body;
	refreshTokens = refreshTokens.filter(t => t !== token);

	res.send({message: "Logout successful"});
});

module.exports = router