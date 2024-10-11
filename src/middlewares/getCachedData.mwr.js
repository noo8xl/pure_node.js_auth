import {CacheService} from "../services/cache/cacheService.js";

export async function GetCachedProfile(req, res, next) {
	try {
		let c = await new CacheService().GetUserCache(req.params.userId)
		if(!Object.keys(c).length) next()
		else return res.status(200).json(c)
	} catch (e) {
		next(e.message);
	}
}