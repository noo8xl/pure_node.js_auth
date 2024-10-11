import {DatabaseService} from "../database/databaseService.js"
import {TokenService} from "./tokenService.js"
import {Helper} from "../../helpers/helper.js"
import {NotificationService} from "../notification/notificationService.js"
import ErrorInterceptor from "../../exceptions/ErrorInterceptor.js";

export default class AuthService {
  #userName
  #userEmail
  #userPassword
  #token
  #twoStep
  #twoStepCode
  #activationLink

	#helper
	#notification
	#tokenService
	#db

  constructor(userDto){ // is obj with user data from the client
    this.#userEmail = userDto.userEmail
    this.#userPassword = userDto.userPassword
    this.#token = userDto.token
    this.#twoStepCode = userDto.twoStepCode
    this.#userName = userDto.userName
    this.#activationLink = userDto.activationLink

	  this.#notification = new NotificationService()
	  this.#db = new DatabaseService()
	  this.#tokenService = new TokenService()
	  this.#helper = new Helper()
  }

  // signUp -> sign up a new user
  async signUp(){

    try {
      this.#activationLink = await this.#helper.GeneratePassword(this.#userEmail)

      let userDto = {
        userName: this.#userName,
        userEmail: this.#userEmail,
        userPassword: this.#userPassword,
        activationLink: this.#activationLink
      }

      await this.#db.CreateUser(userDto)
      await this.#notification.sendActivationMail(userDto.userEmail, userDto.activationLink)
    } catch (e) {
      throw await ErrorInterceptor.ServerError("_db_signUp", e.message)
    }
  }

  // activateAccount -> validate an account activation link
  async activateAccount(){
    await this.#db.ActivateUserAccount(this.#activationLink)
  }

  async signin(){ // return bool or user dto with auth token
    
    let userDto = {}
    let user = {}
    let tokens = {}

    try {
      user = await this.#db.GetUserByIdOrEmail(this.#userEmail)
      if(!Object.keys(user).length) throw ErrorInterceptor.NotFoundError()
      if(user.userPassword !== this.#userPassword) throw ErrorInterceptor.BadRequest('wrong password')

      tokens = await this.#issueTokenPair()
      userDto.userId = user._id.toString()
      userDto.refreshToken = tokens.refreshToken
      await this.#db.SaveToken(userDto)

	    return { tokens, user }
    } catch (e) {
      throw await ErrorInterceptor.ServerError("_auth_login", e.message)
    }
  }

  // forgotPwd -> forgot password handler 
  async forgotPwd(){
    const user = await this.#db.GetUserByIdOrEmail(this.#userEmail)
    const pwd = await this.#helper.GeneratePassword(user)
    await this.#db.UpdateUserPassword(user._id, pwd)
  }

  async logout(){
    await this.#db.RemoveToken(this.#token)
  }


  // #######################################################################################################
  // ########################################### private area ##############################################
  // #######################################################################################################

  // issueTokenPair -> generate auth token by user dto
  async #issueTokenPair(){
    let payload = {
      userEmail: this.#userEmail,
      userPassword: this.#userPassword
    }
    return await this.#tokenService.GenTokenPair(payload)
  }

  
}