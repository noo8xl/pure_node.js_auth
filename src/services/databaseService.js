import { MongoClient } from 'mongodb'
import ApiError from '../exceptions/apiError.expt.js'
import { mongoDb } from '../config/config.js'

class DatabaseService {
  #uri = mongoDb.uri
  #db_name = mongoDb.name
  #client

  constructor(){}

  // #####################################################################################

  // #dbName -> is database name 
  // #client -> is instance of connection 
  // colName -> database collection name
  // dto -> data transfer object (your data)
  // fName -> filter object name (ex: {fName: "some value"})
  // fVal -> filter object data  (ex: {someKey: fVal})
  // uDoc -> object (document) with data which should be updated (ex: {userName: "some value"})
  // filterData -> is object with some data (ex: {user: "test1", password: "pwd1", etc.})

  // #####################################################################################


  // CheckTwoStepAuth > check is 2fa auth turned on
  // and then return bool value <-
  async CheckTwoStepAuth(userEmail){

    const userId = await this.#databaseFindRequest("User", "userEmail", userEmail)
    if (!userId) throw await ApiError.BadRequest()

    const result = await this.#databaseFindRequest("UserParams", "twoStepAuth", userId)
    if(!result.twoStepAuth) return false
    return true
  }

  async GetTwoStepParams(userId){
    return await this.#databaseFindRequest("TwoStepParams", userId, userId)
  } 

  async VerifiedCode(userEmail, code){
    const res = await this.#databaseFindMultFilterRequest("TwoStepCodeList", {userEmail, code})
    if(code !== res.code) return false
    return true
  }

  // CreateUser > insert data to db and return userId val <-
  async CreateUser(userDto) { 
    userDto.createdAt = new Date().getTime()

    let resultId = ""

    let params = {
      userId: "",
      isActivated: false,
      twoStepAuth: false,
      activationLink: userDto.activationLink
    }

    delete userDto.activationLink

    let twoStepParams = {
      userId: "",
      type: "empty", // email OR telegram 
      enableDate: 0, // update to cur date at Enable 2fa
      telegramId: 0, // int64 id here <-
    }

    // create base user table
    const userId = await this.#databaseInsertRequest("User", userDto)
    resultId = userId
    params.userId = userId
    twoStepParams.userId = userId
    // -> create user params table and next 2fa params table 
    await this.#databaseInsertRequest("UserParams", params)
    await this.#databaseInsertRequest("TwoStepParams", twoStepParams)

    return resultId
  }


  // ActivateUserAccount -> activate user account with activation link 
  async ActivateUserAccount(link) {
    const request = await this.#databaseFindRequest("UserParams", "activationLink", link)
    if(request.activationLink !== link) return false

    // update isActivate status < -
    await this.#databaseUpdateRequest("UserParams", "activationLink", link, {isActivated: true})
    return true
  }

  // GetUserByIdOrEmail > find user by id OR email 
  // and return user object OR bool false value <-
  async GetUserByIdOrEmail(str){ 
    let user = {}

    !str.includes("@")
      ? user = await this.#databaseFindRequest("User", "_id", str)
      : user = await this.#databaseFindRequest("User", "userEmail", str)

    return user 
  }

  // UpdateUserPassword -> update user pwd by userId 
  async UpdateUserPassword(userId, userPassword) {
    return await this.#databaseUpdateRequest("User", {userId}, {userPassword})
  }

  // SaveToken -> save auth token to db
  async SaveToken(userDto){
    return await this.#databaseInsertRequest("Token", userDto)
  }

  // ValidateToken > find token and return bool value <-
  async FindToken(t){
    return await this.#databaseFindRequest("Token", "refreshToken", t)
  }

  // RemoveToken -> remove auth token
  async RemoveToken(t){
    return await this.#databaseDeleteRequest("Token", "refreshToken", t)
  }

  // ===========================================================================================//
  // =================================== private method area ===================================//
  // ===========================================================================================//


  // databaseInsertRequest -> insert data to chosen collection
  async #databaseInsertRequest(colName, dto) {
    await this.#connect()
    const cl = this.#client 
    const database = cl.db(this.#db_name)
    const colection = database.collection(colName)
    let insId = ""

    try {
      let result = await colection.insertOne(dto)
      insId = result.insertedId.toString()
    } catch (e) {
      throw await ApiError.ServerError("_db_DatabaseInsertRequest", e.message)
    } finally {
      await cl.close()
    }
    return insId
  }

  // databaseFindMultFilterRequest -> find one request with multifield obj to filter 
  async #databaseFindMultFilterRequest(colName, filterData) {
    await this.#connect()
    const cl = this.#client 
    const database = cl.db(this.#db_name)
    const colection = database.collection(colName)

    let filter = {}
    let keyList = Object.keys(filterData)
    let valuetList = Object.values(filterData)
    
    for (let i = 0; i <= keyList.length -1; i++)
      filter[keyList[i]] = valuetList[i]
    
    let result = {}
    try {
      result = await colection.findOne(filter)
    } catch (e) {
      throw await ApiError.ServerError("_db_DatabaseFindMultFilterRequest", e.message)
    } finally {
      await cl.close()
    }
    if (!result) throw await ApiError.BadRequest()
    return result
  }

  // databaseFindRequest -> find one by key:value
  async #databaseFindRequest(colName, fName, fVal) {
    await this.#connect()
    const cl = this.#client 
    const database = cl.db(this.#db_name)
    const colection = database.collection(colName)
    let filter = {}
    let result = {}
    filter[fName] = fVal

    try {
      result = await colection.findOne(filter)
    } catch (e) {
      throw await ApiError.ServerError("_db_DatabaseFindRequest", e.message)
    } finally {
      await cl.close()
    }
    if (!result) throw await ApiError.BadRequest()
    return result
  }

  // databaseUpdateRequest -> update document request
  async #databaseUpdateRequest(colName, fName, fVal, uDoc) {
    await this.#connect()
    const cl = this.#client 
    const database = cl.db(this.#db_name)
    const colection = database.collection(colName)
    let filter = {}
    let result
    filter[fName] = fVal
    const updatedDoc = {$set: uDoc}

    try {
      result = await colection.updateOne(filter, updatedDoc)
      console.log("result.modifiedCount => ", result.modifiedCount);
    } catch (e) {
      throw await ApiError.ServerError("_db_DatabaseUpdateRequest", e.message)
    } finally {
      await cl.close()
    }
    if (result.modifiedCount < 1) throw await ApiError.BadRequest()
    return true
  }

  // databaseDeleteRequest -> delete from db handler
  async #databaseDeleteRequest(colName, fName, fVal) {
    await this.#connect()
    const cl = this.#client 
    const database = cl.db(this.#db_name)
    const colection = database.collection(colName)
    let filter = {}
    let result = {}
    filter[fName] = fVal

    try {
      result = await colection.deleteOne(filter)
    } catch (e) {
      throw await ApiError.ServerError("_db_DatabaseDeleteRequest", e.message)
    } finally {
      await cl.close()
    }
    if (!result) throw await ApiError.BadRequest()
    return true
  }

  // =======================================

  // connect -> connect to db and set a new client 
  async #connect() {
    this.#client = new MongoClient(this.#uri)
    return
  }
  
}

export default new DatabaseService();