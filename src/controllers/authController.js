import Helper from "../helpers/helper.js"
import AuthService from "../services/authService.js"
import CacheService from "../services/cacheService.js"


class AuthController {

  // signUp -> registrate a new user
  async signUp(req, res, next) {
    const userDto = {
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      userName: req.body.userName, // code or ""
    }

    try {
      const init = new AuthService(userDto)
      await init.signUp()
    } catch (e) {
      next(e) 
    } 
    return res.status(201).json({message: "ok"}).end()
  }

  // activateAccount -> validate link and change account status to activate 
  async activateAccount(req, res, next){
    const activationLink = req.params.link
    let result // <- boolean

    try {
      const init = new AuthService({activationLink})
      result = await init.activateAccount()
    } catch (e) {
      next(e) 
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

    try {
      const init = new AuthService(userDto)

      if(userDto.twoStepCode !== "") {
        
        isTwoStep = await init.checkTwoStep()
        if (isTwoStep) return res
          .status(200)
          .json({message: "Two step turned on.",status: true})
          .end()

        isValid = await init.getVerifiedTwoStepCode()
        if (!isValid) return res
          .status(400)
          .json({message: "Wrong two step code."})
          .end()
      } 

      const result = await init.signin()
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
      next(e)
    }
  }

  // forgotPassword -> forgot pwd handler
  async forgotPassword(req, res, next){
    const userEmail = req.params.userEmail

    try {
      const init = new AuthService({userEmail})
      await init.forgotPwd()

      return res.status(200).end()
    } catch (e) {
      next(e)
    }
  }


  // refresh -> refresh user data for auth 
  async refresh(req, res, next){
    const token = req.cookies.refreshToken

    try {
      const init = new AuthService({token})
      const result = await init.refresh() 

      res.cookie('refreshToken', result.tokens.refreshToken, {
        maxAge: 30 * 4 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })

      return res.status(200).json(result).end()
    } catch (e) {  
      next(e)
    }
  }


  // logout -> remove tokens and terminate the user session
  async logout(req, res, next){
    const token = req.cookies.refreshToken
    const userId = req.params.userId
    try {
      const init = new AuthService({token})
      await init.logout()

      await CacheService.ClearCahce(userId)
      await res.clearCookie('refreshToken')

      return res.status(200).end()
    } catch (e) {
      next(e)
    }
  }

  // =================================================
  // =========== > helper handler below < ============
  // =================================================

  // async fun(params) {
  //   return
  // }
}

export default new AuthController();