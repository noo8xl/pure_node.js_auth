import {mongoDb} from "../../config/config.js";
import {MongoClient} from "mongodb";
import ErrorInterceptor from "../../exceptions/ErrorInterceptor.js";


export class DatabaseCore {
	#client
	#uri = mongoDb.uri
	#db_name = mongoDb.name

	// #####################################################################################

	// #db_name -> is database name
	// #client -> is an instance of connection
	// collectionName -> database collection name
	// dto -> data transfer object ( your data )
	// filterKey -> filter object name (ex: { filterKey: "some value" })
	// filterValue -> filter object data  (ex: { someKey: filterValue })
	// dataToUpdate -> object with data which should be updated (ex: { userName: "some value" })
	// filterData -> is object with some data (ex: {user: "test1", password: "pwd1", etc.})

	// #####################################################################################

	constructor() {}

	// databaseInsertRequest -> insert data to chosen collection
	async _InsertRequest(collectionName, dto) {

		let insId = ""
		let result;

		try {
			await this.#connect()
			const database = this.#client.db(this.#db_name)
			const collection = database.collection(collectionName)

			result = await collection.insertOne(dto)
			insId = result.insertedId.toString()
		} catch (e) {
			throw await ErrorInterceptor.ServerError("_db_DatabaseInsertRequest: " + e.message)
		} finally {
			await this.#client.close()
		}
		return insId
	}

	// FindMultiplyFilterRequest -> find one request with multiple field obj to filter
	async _FindMultiplyFilterRequest(collectionName, filterData) {

		let filter = {}
		let keyList = Object.keys(filterData)
		let valuesList = Object.values(filterData)
		let result = {}

		for (let i = 0; i <= keyList.length -1; i++)
			filter[keyList[i]] = valuesList[i]

		try {
			await this.#connect()
			const database = this.#client.db(this.#db_name)
			const collection = database.collection(collectionName)

			result = await collection.findOne(filter)
		} catch (e) {
			throw await ErrorInterceptor.ServerError("_FindMultiplyFilterRequest", e.message)
		} finally {
			await this.#client.close()
		}
		if (!result) throw ErrorInterceptor.ExpectationFailed()
		return result
	}

	// databaseFindRequest -> find one by key:value
	async _FindRequest(collectionName, filterKey, filterValue) {

		let filter = {}
		let result = {}
		filter[filterKey] = filterValue

		console.log(filter)

		try {
			await this.#connect()
			const database = this.#client.db(this.#db_name)
			const collection = database.collection(collectionName)

			result = await collection.findOne(filter)

			console.log(result)
		} catch (e) {
			throw await ErrorInterceptor.ServerError("_db_DatabaseFindRequest", e.message)
		} finally {
			await this.#client.close()
		}
		if(!result) throw ErrorInterceptor.BadRequest()
		return result
	}

	// databaseUpdateRequest -> update document request
	async _UpdateRequest(collectionName, filterKey, filterValue, dataToUpdate) {

		let result;
		let filter = {}
		filter[filterKey] = filterValue
		const updatedObj = {$set: dataToUpdate}

		try {
			await this.#connect()
			const database = this.#client.db(this.#db_name)
			const collection = database.collection(collectionName)

			result = await collection.updateOne(filter, updatedObj)
		} catch (e) {
			if (result.modifiedCount < 1) throw ErrorInterceptor.ExpectationFailed("data was not updated")
			throw await ErrorInterceptor.ServerError("_db_DatabaseUpdateRequest", e.message)
		} finally {
			await this.#client.close()
		}
	}

	// databaseDeleteRequest -> delete from db handler
	async _DeleteRequest(collectionName, filterKey, filterValue) {

		let filter = {}
		let result = {}
		filter[filterKey] = filterValue

		try {
			await this.#connect()
			const database = this.#client.db(this.#db_name)
			const collection = database.collection(collectionName)

			result = await collection.deleteOne(filter)
		} catch (e) {
			throw await ErrorInterceptor.ServerError("_db_DatabaseDeleteRequest", e.message)
		} finally {
			await this.#client.close()
		}
	}

	// ___________________________________________________-

	// connect -> connect to db and set a new client
	async #connect() {
		this.#client = new MongoClient(this.#uri)
	}
}