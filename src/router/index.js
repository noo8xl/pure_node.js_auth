import { Router } from "express"
import UserController from '../controllers/userController.js'
import AuthController from '../controllers/authController.js'
const router = Router()

// authChecker -> validate access auth token <- 
import authChecker from "../middlewares/auth.mwr.js"
import {GetCachedProfile} from "../middlewares/getCachedData.mwr.js";

// ===========================================================================================//
// ================================== handle auth endpoints ==================================//
// ===========================================================================================//


// registration <- 
router.post(
  "/auth/sign-up/",  
  AuthController.signUp
)

// activate an account via a generated link<-
router.patch(
  "/auth/activate/:link/",  
  AuthController.activateAccount
)

// login <-
router.post(
  "/auth/sign-in/",  
  AuthController.signIn
)

// forgot password <-
router.patch(
  "/auth/forgot-password/:userEmail/",  
  AuthController.forgotPassword
)

// logout <-
router.get(
  "/auth/logout/:userId/",
  AuthController.logout
)


// ===========================================================================================//
// ================================= handle user endpoints ===================================//
// ===========================================================================================//

// test profile page <-
router.get(
  "/profile/:userId/",
  authChecker,
	GetCachedProfile,
  UserController.profile
)


export default router;