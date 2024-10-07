import {scrypt} from "crypto"
import { jwtAuth } from "../config/config.js"
import ErrorInterceptor from "../exceptions/ErrorInterceptor"


// Helper -> help to do some actions like generate or sort some
class Helper {

  // GeneratePassword > generate unique code by userData <-
  // doc is here -> 
  // https://www.geeksforgeeks.org/node-js-crypto-createhash-method/
  async GeneratePassword(dto) {

    return scrypt(dto.toString(), jwtAuth.secret, 32, (err, key) => {
      if (err) 
        throw new ErrorInterceptor.ExpectationFailed('Code generation was failed')
      else return key
    })

  }


  // PrepareUserCacheData -> prepare regular userDto to redis obj
  async PrepareUserCacheData(dto, t){
    // copying <-
    let c = JSON.parse(JSON.stringify(dto))

    delete c.createdAt
    c._id = c._id.toString()
    c.token = t
    c.action = ""

    return c
  }
  
}

export default new Helper();