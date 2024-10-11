import NotificationService from "../services/notification/notificationService.js"

// ErrorInterceptor -> handle an API errors
export default class ErrorInterceptor extends Error {

  message
  status  
  errors
	
  static notification // static

  constructor(status, message, errors = []){
    super(message)
    this.message = message
    this.status = status
    this.errors = errors
		this.notification = new NotificationService()
  }

  static async PermissionDenied(action) {
    // await this.notification.sendTelegramErrorMessage(`Catch permission denied error at ${action}.`)
    return new ErrorInterceptor(403, "Permission denied.")
  }

	static async ServerError(action) {
		// await this.notification.sendTelegramErrorMessage(`${action} was failed.`)
		return new ErrorInterceptor(500, "Internal server error.")
	}

  static BadRequest(action) {
    return new ErrorInterceptor(400, !action ? "Bad request." : action)
  }

  static UnauthorizedError() {
    return new ErrorInterceptor(401, "Unauthorized error.")
  }

  static NotFoundError() {
    return new ErrorInterceptor(404, "Not found.")
  }

  static ExpectationFailed(msg) {
    throw new ErrorInterceptor(417, !msg ? "Expectation failed." : msg)
  }

  // ############################################################################################## //
  
}
