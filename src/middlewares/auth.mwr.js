import ErrorInterceptor from "../exceptions/ErrorInterceptor.js"
import TokenService from '../services/auth/tokenService.js'


// auth middleware -> handle access key to the api from client side
export default async function authChecker(req, res, next) {
  const authorizationHeader = req.headers.authorization
  const accessToken = authorizationHeader.split(' ')[1]
  try {
    if (!authorizationHeader) return next(ErrorInterceptor.UnauthorizedError())
    if (!accessToken) return next(ErrorInterceptor.UnauthorizedError())
    if (!isValid) return next(ErrorInterceptor.UnauthorizedError())

    const isValid = await TokenService.ValidateToken(accessToken)
    next()
  } catch (e) {
    return next(ErrorInterceptor.UnauthorizedError())
  }
}