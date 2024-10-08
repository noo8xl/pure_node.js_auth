
import CacheService from "../services/cache/cacheService.js"
import ErrorInterceptor from "../exceptions/ErrorInterceptor.js";
import DatabaseService from "../services/database/databaseService.js";

class UserController {

	// #databaseService;
	//
	// constructor() {
	// 	this.#databaseService = new DatabaseService();
	// }
	//
  async dashboard(req, res, next){
    const userId = req.params.userId
    console.log("userId => ", userId);
    try {
      console.log('test dashboard ');
      
    } catch (e) {
      await ErrorInterceptor.DefineAndCallAnError(e)
    }
    return res.status(200).json(true).end()
  }

  async profile(req, res, next){
    const userId = req.params.userId
    let result = {}

    try {
      // result = await CacheService.GetUserCache(userId)
      // if(!result) result = await databaseService.GetUserByIdOrEmail(userId)
				//

	    result = await DatabaseService.GetUserByIdOrEmail(userId)
	    // if (!result)
        // -> need a refactor * 
      // delete result.action
	    return res.status(200).json(result).end()

    } catch (e) {
      throw await ErrorInterceptor.DefineAndCallAnError(e)
    }

  }
}

export default new UserController();