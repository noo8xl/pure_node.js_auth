import {createClient} from 'redis'
import ErrorInterceptor from '../../exceptions/ErrorInterceptor.js';
import {redisStore} from "../../config/config.js"

// the doc is -> 
// https://redis.io/docs/connect/clients/nodejs/
export class CacheService {
  #client;

	constructor() {}

  // ClearCache -> clear user cache data by userId
  async ClearCache(userId){
		try {
      await this.#connect()
			await this.#client.del(userId)

    } catch (e) {
      throw ErrorInterceptor.ExpectationFailed(e.message)
    } finally {
      await this.#client.disconnect();
    }
  }

  // GetUserCache -> get user cached data by key
  async GetUserCache(key){
    try {
      await this.#connect()

      const obj = await this.#client.hGetAll(key);
      return  JSON.parse(JSON.stringify(obj, null, 2))

    } catch (e) {
      throw ErrorInterceptor.ExpectationFailed(e.message)
    } finally {
      await this.#client.disconnect();
    }
  }

  // SetUserCache -> set user cache data obj to have a fast access to data
  async SetUserCache(userId, dto){

		let data = this.#prepareCacheData(dto)

    try {
      await this.#connect()
      await this.#client.hSet(userId, data,'PX', 1_800_000) // will be expired in 30 min
      
    } catch (e) {
      throw ErrorInterceptor.ExpectationFailed(e.message)
    } finally {
      await this.#client.disconnect();
    }
  }
  
  // #######################################################################################################
  // ########################################### private area ##############################################
  // #######################################################################################################


	#prepareCacheData(dto){
		let map = new Map()
		for (let i = 0; i < Object.keys(dto).length; i++)
			map.set(`${Object.keys(dto)[i]}`, `${Object.values(dto)[i]}`)
		return map;
	}

  // connect -> connect to redis and create a new rdb client
  async #connect(){

    const url = redisStore.url
    const client = createClient({url})

    client.on('error', async (err) => { throw await ErrorInterceptor.ServerError("_redis_ "+ err.message) })
    client.on('connect', () => console.log('Redis connected'))
    client.on('reconnecting', () => console.log('Redis reconnecting'))
	  client.on('end', () => console.log('Redis disconnected'))
      
    await client.connect()
    this.#client = client
  }

}
