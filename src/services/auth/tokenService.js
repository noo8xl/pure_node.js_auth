import jwt from "jsonwebtoken"
import ErrorInterceptor from "../../exceptions/ErrorInterceptor.js"
import {jwtAuth} from "../../config/config.js"
import {DatabaseService} from "../database/databaseService.js";

// TokenService -> implements a jwt-token logic
// and creates saves and validate auth token
// which comes with a user request
export class TokenService {
  #secret = jwtAuth.secret
	#db

	constructor() {
		this.#db = new DatabaseService();
	}

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

	    return { accessToken,refreshToken }
    } catch (e) {
      throw await ErrorInterceptor.ServerError("_GenTokenPair_", e.message)
    }
  } 

  // ValidateToken -> validate user auth token 
  async ValidateToken(token){
    await jwt.verify(token, this.#secret, function(err, decode) {
      if(err) throw ErrorInterceptor.ExpectationFailed(err);
      console.log('decoded token is -> ', decode);
    })
  }

  // FindToken -> find token in database
  async FindToken(t){
    return await this.#db.FindToken(t)
  }
}