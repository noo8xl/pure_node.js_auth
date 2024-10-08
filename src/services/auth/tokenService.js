import jwt from "jsonwebtoken"
import DatabaseService from "../database/databaseService.js"
import ErrorInterceptor from "../../exceptions/ErrorInterceptor.js"
import { jwtAuth } from "../../config/config.js"

// TokenService -> implements a jwt-token logic
// and create, save and validate auth token 
// which come with user request 
class TokenService {
  #secret = jwtAuth.secret

  // GenTokenPair -> generate new token pair by user DTO
  async GenTokenPair(payload) {
    let accessToken = "" 
    let refreshToken = ""

    try {
      accessToken = jwt.sign(
        payload, 
        this.#secret, 
        {expiresIn: '30m'})

      refreshToken = jwt.sign(
        payload, 
        this.#secret, 
        {expiresIn: '4h'})
    } catch (e) {
      throw await ErrorInterceptor.ServerError("_GenTokenPair_", e.message)
    }

    console.log("tokens =>\n", accessToken, "\n", refreshToken);
    return { accessToken,refreshToken }
  } 

  // ValidateToken -> validate user auth token 
  async ValidateToken(token){
    return jwt.verify(token, this.#secret, function(err,decode) {
      if(err) console.error("err =>", err );
      return decode
    })
  }

  // FindToken -> find token in database 
  async FindToken(t){
    return await DatabaseService.FindToken(t)
  }
}

export default new TokenService();