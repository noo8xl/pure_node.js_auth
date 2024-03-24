import jwt from "jsonwebtoken"
import DatabaseService from "./databaseService.js"
import ApiError from "../exceptions/apiError.expt.js"
import { jwtAuth } from "../config/config.js"

// TokenService -> handle jwt-token logic
// and create, save and validate auth token 
// which come with request 
class TokenService {
  #privateKey = jwtAuth.secret

  // GenTokenPair -> generate new token pair by user DTO
  async GenTokenPair(payload) {
    let accessToken = "" 
    let refreshToken = ""
    try {
      accessToken = jwt.sign(
        payload, 
        this.#privateKey, 
        {expiresIn: '30m'})

      refreshToken = jwt.sign(
        payload, 
        this.#privateKey, 
        {expiresIn: '4h'})
    } catch (e) {
      throw await ApiError.ServerError("_GenTokenPair_", e.message)
    }

    console.log("tokens =>\n", accessToken, "\n", refreshToken);
    return {
      accessToken,
      refreshToken
    }
  } 

  // ValidateToken -> validate user auth token 
  async ValidateToken(token){
    return jwt.verify(token, this.#privateKey, function(err,decode) {
      if(err) console.error("err =>", err );
      console.log("decode =>\n", decode);
      return decode
    })
  }

  // FindToken -> find token in database 
  async FindToken(t){
    return await DatabaseService.FindToken(t)
  }
}

export default new TokenService();