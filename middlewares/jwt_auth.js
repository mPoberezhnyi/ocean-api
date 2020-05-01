const jwt = require('jsonwebtoken')
const config = require('config')

const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, config.get('jwtSecret'), (err, user) => {
			if (err) {
				return res.status(201).json({isUser: false});
			}
			req.user = user;
			next();
		});
	} else {
		res.status(401).json({message: 'Wrong data'});
	}
};

module.exports = authenticateJWT