import {createClient} from 'redis'
import ErrorInterceptor from '../../exceptions/ErrorInterceptor.js';
import {redisStore} from "../../config/config.js"

// the doc is -> 
// https://redis.io/docs/connect/clients/nodejs/
// <- 
class CacheService {

  #client;

  // the cache is ==== >
  // = > userDto is Object with :
  //  {
  //   userEmail: req.body.userEmail,
  //   userPassword: req.body.userPassword,
  //   twoStepCode: req.body.twoStepCode,
  //   token: "string",
  //   action: "string"
  // }



  // should update ?? < --
  // ClearCahce -> clear user cache data by userId
  async ClearCahce(userID){
    try {
      
      await this.#connect()
      await cl.functionDelete(userID)

    } catch (e) {
      throw ErrorInterceptor.DefineAndCallAnError(e)
    } finally {
      await cl.disconnect();
    }
  }

  // GetUserCache -> get user cached data by key
  async GetUserCache(key){
    let c = {}

    try {
      await this.#connect()
    
      const temp = await this.#client.hGetAll(key);
      c = JSON.parse(JSON.stringify(temp, null, 2))
  
      console.log("user cache is\n=> ", c);
      
    } catch (e) {
      throw ErrorInterceptor.DefineAndCallAnError(e)
    } finally {
      await cl.disconnect();
    }

    return c
  }

  // SetUserCache -> set user cache data obj to have a fast access to data
  async SetUserCache(userId, dto){
    console.log("c dto =>\n",userId, "\n", dto);

    try {
      await this.#connect()
      await this.#client.hSet(userId, dto)
      
    } catch (e) {
      throw ErrorInterceptor.DefineAndCallAnError(e)
    } finally {
      await cl.disconnect();
    }
  }
  
  // #######################################################################################################
  // ###################################### private area methods ###########################################
  // #######################################################################################################

  // connect -> connect to redis and create a new rdb client
  async #connect(){

    // const client = createClient({
    //   username: 'default', // use your Redis user. More info https://redis.io/docs/management/security/acl/
    //   password: 'secret', // use your password here
    //   socket: {
    //       host: 'my-redis.cloud.redislabs.com',
    //       port: 6379,
    //       tls: true,
    //       key: readFileSync('./redis_user_private.key'),
    //       cert: readFileSync('./redis_user.crt'),
    //       ca: [readFileSync('./redis_ca.pem')]
    //   }
    // });

    const url = redisStore.url
    const client = createClient({url})

    client.on('error', async (err) => { throw await ErrorInterceptor.ServerError("_redis_", err.message) })
    client.on('connect', () => console.log('Redis connected'))
    client.on('reconnecting', () => console.log('Redis reconnecting'))
      
    await client.connect()
    this.#client = client
  }

}

export default new CacheService();