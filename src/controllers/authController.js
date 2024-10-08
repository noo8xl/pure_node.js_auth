import ErrorInterceptor from "../exceptions/ErrorInterceptor.js"
import Helper from "../helpers/helper.js"
import AuthService from "../services/auth/authService.js"
import CacheService from "../services/cache/cacheService.js"


class AuthController {

  // signUp -> registrate a new user
  async signUp(req, res, next) {

    const userDto = {
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      userName: req.body.userName, // code or ""
    }

    try {
      await new AuthService(userDto).signUp()
    } catch (e) {
      throw await ErrorInterceptor.DefineAndCallAnError(e)
    } 
    return res.status(201).json({message: "ok"}).end()
  }

  // activateAccount -> validate link and change account status to activate 
  async activateAccount(req, res, next){
    const activationLink = req.params.link
    let result // <- boolean

    try {
      await new AuthService({activationLink}).activateAccount()
    } catch (e) {
      next(await ErrorInterceptor.DefineAndCallAnError(e))
    } 
    if (!result) return res.status(400).end()
    return res.status(202).end()
    
  }

  // signIn -> handle login here
  async signIn(req, res, next){

    const userDto = {
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      twoStepCode: req.body.twoStepCode, // code or ""
    }

    let isTwoStep = false
    let isValid = false
    let twoFaMsg = "Two step turned on."

    try {
      const service = new AuthService(userDto)

      if(userDto.twoStepCode !== "") {
        
        isTwoStep = await service.checkTwoStep()
        if (isTwoStep) return res.status(200).json({message: twoFaMsg,status: true}).end()

        isValid = await service.getVerifiedTwoStepCode()
        if (!isValid) throw ErrorInterceptor.BadRequest("Wrong two step code.")
      } 

      const result = await service.signin()
      const c = await Helper.PrepareUserCacheData(result.user, result.tokens.refreshToken)      
      await CacheService.SetUserCache(c._id, c)

      res.cookie('refreshToken', result.tokens.refreshToken, {
        maxAge: 30 * 4 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })

      return res.status(200).json(result).end()
    } catch (e) {
      next(await ErrorInterceptor.DefineAndCallAnError(e))
    }
  }

  // forgotPassword -> forgot pwd handler
  async forgotPassword(req, res, next){
    const userEmail = req.params.userEmail

    try {
      await new AuthService({userEmail}).forgotPwd()
    } catch (e) {
      next(await ErrorInterceptor.DefineAndCallAnError(e))
    }

    return res.status(200).end()
  }


  // refresh -> refresh user data for auth 
  async refresh(req, res, next){
    const token = req.cookies.refreshToken

    try {
      const result = await new AuthService({token}).refresh() 

      res.cookie('refreshToken', result.tokens.refreshToken, {
        maxAge: 30 * 4 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })

    } catch (e) {  
      next(await ErrorInterceptor.DefineAndCallAnError(e))
    }
    return res.status(200).json(result).end()
  }


  // logout -> remove tokens and terminate the user session
  async logout(req, res, next){
    const token = req.cookies.refreshToken
    const userId = req.params.userId
    
    try {
      await new AuthService({token}).logout()
      await CacheService.ClearCustomerCahce(userId)
      await res.clearCookie('refreshToken')

    } catch (e) {
      next(await ErrorInterceptor.DefineAndCallAnError(e))
    }
    return res.status(200).end()
  }
}

export default new AuthController();