import {TokenService} from '../services/auth/tokenService.js'

// auth middleware -> handle an access key to the api from the client side
export default async function authChecker(req, res, next) {
	if (!req.headers.authorization) return res.status(401).send('No auth headers provided')

	const authorizationHeader = req.headers.authorization
	const accessToken = authorizationHeader.split(' ')[1]

	try {
    await new TokenService().ValidateToken(accessToken)
    next()
  } catch (e) {
		next(e.message)
  }
}