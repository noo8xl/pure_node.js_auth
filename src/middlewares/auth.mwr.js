import ErrorInterceptor from "../exceptions/ErrorInterceptor"
import TokenService from '../services/tokenService.js'


// auth middleware -> handle access key to the api from client side
export default async function (req, res, next) {
  const authorizationHeader = req.headers.authorization
  const accessToken = authorizationHeader.split(' ')[1]
  const isValid = await TokenService.ValidateToken(accessToken)
  try {
    if (!authorizationHeader) return next(ErrorInterceptor.UnauthorizedError())
    if (!accessToken) return next(ErrorInterceptor.UnauthorizedError())
    if (!isValid) return next(ErrorInterceptor.UnauthorizedError())
    next()
  } catch (e) {
    return next(ErrorInterceptor.UnauthorizedError())
  }
}