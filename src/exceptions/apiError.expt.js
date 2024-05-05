import {Telegram} from "../api/telegram.api.js"

// ErrorHandler > handle each error amoung project <-
async function ErrorHandler(area, txt) {
  let msg = "auth_tmplt receive an error at" + area + " " + txt;
  console.error(msg)
  const init = new Telegram()
  await init.SendErrorMsg(msg)
}

// ApiError -> handle errors with response
// to the client and to the developer telegram
export default class ApiError extends Error {
  message
  status
  errors

  constructor(status, message, errors= []) {
    super(message)
    this.message = message
    this.status = status
    this.errors = errors
  }

  static async UnauthorizedError(){
    return new ApiError(401, 'Unauthorized user')
  }

  static async PermissionDenied(area, txt) {
    const msg = txt + " _ " + "Permission denied!"
    await ErrorHandler(area, msg)
    return new ApiError(403, msg)
  }

  static async BadRequest() {
    return new ApiError(400, "Bad request")
  }

  static async ServerError(area, txt) {
    const msg = txt + " _ " + "Internal Error."
    await ErrorHandler(area, msg)
    return new ApiError(500, msg)
  }
}

