
import {DatabaseService} from "../services/database/databaseService.js";

class UserController {

  async profile(req, res,next){
    try {
      let result = await new DatabaseService().GetUserByIdOrEmail(req.params.userId)
	    return res.status(200).json(result).end()
    } catch (e) {
	    next(e.message)
    }
  }
}

export default new UserController();