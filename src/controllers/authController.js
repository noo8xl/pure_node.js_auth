import AuthService from "../services/auth/authService.js"
import {CacheService} from "../services/cache/cacheService.js"


class AuthController {

  // signUp -> register a new user
  async signUp(req, res, next) {

    const userDto = {
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      userName: req.body.userName, // code or ""
    }

    try {
      await new AuthService(userDto).signUp()
	    return res.status(201).json({message: "User was created."}).end()
    } catch (e) {
      next(e.message)
    }
  }

  // activateAccount -> validate link and change account status to activate 
  async activateAccount(req, res, next) {
    const activationLink = req.params.link

    try {
      await new AuthService({activationLink}).activateAccount()
	    return res.status(202).end()
    } catch (e) {
	    next(e.message)
    }
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

      // if(userDto.twoStepCode !== "") {
      //
      //   isTwoStep = await service.checkTwoStep()
      //   if (isTwoStep) return res.status(200).json({message: twoFaMsg,status: true}).end()
			//
      //   isValid = await service.getVerifiedTwoStepCode()
      //   if (!isValid) throw ErrorInterceptor.BadRequest("Wrong two step code.")
      // }

      const result = await service.signin()
      await new CacheService().SetUserCache(result.user._id.toString(), result.user)

      res.cookie('refreshToken', result.tokens.refreshToken, {
        maxAge: 30 * 4 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })

      return res.status(200).json(result).end()
    } catch (e) {
	    next(e.message)
    }
  }

  // forgotPassword -> forgot pwd handler
  async forgotPassword(req, res, next){
    const userEmail = req.params.userEmail

    try {
      await new AuthService({userEmail}).forgotPwd()
	    return res.status(200).end()
    } catch (e) {
	    next(e.message)
    }
  }

  // logout -> remove tokens and stop the user session
  async logout(req, res, next){
    const token = req.cookies.refreshToken
    const userId = req.params.userId
    
    try {
      await new AuthService({token}).logout()
      await new CacheService().ClearCache(userId)
      await res.clearCookie('refreshToken')

	    return res.status(200).end()
    } catch (e) {
	    next(e.message)
    }

  }
}

export default new AuthController();