import {DatabaseCore} from "./databaseCore.js";
import {ObjectId} from "mongodb";
import ErrorInterceptor from "../../exceptions/ErrorInterceptor.js";

export class DatabaseService extends DatabaseCore{

  constructor(){
		super()
  }

  // CheckTwoStepAuth > check is 2fa auth turned on
  // and then return bool value <-
  async CheckTwoStepAuth(userEmail){
    const userId = await super._FindRequest("User", "userEmail", userEmail)
    const result = await super._FindRequest("UserParams", "twoStepAuth", userId)
    return result.twoStepAuth;
  }

  async GetTwoStepParams(userId){
    return await super._FindRequest("TwoStepParams", userId, userId)
  } 

  async VerifiedCode(userEmail, code){
    const result = await super._FindMultiplyFilterRequest("TwoStepCodeList", {userEmail, code})
    if(code !== result.code) return false
    return true
  }

  // CreateUser > insert data to db and return userId val <-
  async CreateUser(userDto) { 
    userDto.createdAt = new Date().getTime()
    let resultId = ""

    let params = {
      userId: "",
      isActivated: false,
      twoStepAuth: false,
      activationLink: userDto.activationLink
    }

    delete userDto.activationLink

	  console.log('userDto -> ', userDto)

    let twoStepParams = {
      userId: "",
      type: "empty", // email OR telegram 
      enableDate: 0, // update to cur date at Enable 2fa
      telegramId: 0, // int64 id here <-
    }

    // create a base user table
    const userId = await super._InsertRequest("UserBase", userDto)
    resultId = userId
    params.userId = userId
    twoStepParams.userId = userId
    // -> create user params table and next 2fa params table 
    await super._InsertRequest("UserParams", params)
    await super._InsertRequest("TwoStepParams", twoStepParams)

    return resultId
  }


  // ActivateUserAccount -> activate a user account via an activation link
  async ActivateUserAccount(link) {
    const request = await super._FindRequest("UserParams", "activationLink", link)
    if(request.activationLink !== link) throw ErrorInterceptor.BadRequest('got a wrong link')
    await super._UpdateRequest("UserParams", "activationLink", link, {isActivated: true})
  }

  // GetUserByIdOrEmail > find user by id OR email 
  // and return user object OR bool false value <-
  async GetUserByIdOrEmail(str){
    let user = {}

    !str.includes("@")
      ? user = await super._FindRequest("UserBase", "_id", new ObjectId(str))
      : user = await super._FindRequest("UserBase", "userEmail", str)

    return user
  }

  // UpdateUserPassword -> update user pwd by userId 
  async UpdateUserPassword(userId, userPassword) {
    return await super._UpdateRequest("UserBase", "_id", userId, {userPassword})
  }

  // SaveToken -> save refresh token to db
  async SaveToken(userDto){
    return await super._InsertRequest("Token", userDto)
  }

  // FindToken > find refresh token and return bool value <-
  async FindToken(t){
    return await super._FindRequest("Token", "refreshToken", t)
  }

  // RemoveToken -> remove refresh token
  async RemoveToken(t){
    await super._DeleteRequest("Token", "refreshToken", t)
  }

}

// export default new DatabaseService();