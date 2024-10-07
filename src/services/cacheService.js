import {createClient} from 'redis'
import ApiError from '../exceptions/ErrorInterceptor.js';
import {redisStore} from "../config/config.js"

// the doc is -> 
// https://redis.io/docs/connect/clients/nodejs/
// <- 
class CacheService {

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
    const cl = await this.#connect()
    await cl.functionDelete(userID)
    await cl.disconnect();
    return
  }

  // GetUserCache -> get user cached data by key
  async GetUserCache(key){
    const cl = await this.#connect()

    const temp = await cl.hGetAll(key);
    const c = JSON.parse(JSON.stringify(temp, null, 2))

    // console.log("user session is =>\n", c);
    await cl.disconnect();
    return c
  }

  // SetUserCache -> set user cache data obj to have a fast access to data
  async SetUserCache(userId, dto){
    const cl = await this.#connect()
    console.log("c dto =>\n",userId, "\n", dto);
    await cl.hSet(userId, dto)
    await cl.disconnect();
    return
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

    client.on('error', async (err) => { throw await ApiError.ServerError("_redis_", err.message) })
    client.on('connect', () => console.log('Redis connected'))
    client.on('reconnecting', () => console.log('Redis reconnecting'))
      
    await client.connect()
    return client
  }

}

export default new CacheService();