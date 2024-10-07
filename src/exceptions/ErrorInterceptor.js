import { MongoError } from "mongodb"
import NotificationService from "../services/notificationService"

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
		ErrorInterceptor.notification = new NotificationService()
  }

  static async defineAnError(error) {

    switch (error) {
      case error instanceof ReferenceError:
        return new ErrorInterceptor.ExpectationFailed(e.message)
      case error instanceof TypeError:
        
        break;
      case error instanceof SyntaxError:
        
        break;
      case error instanceof URIError:
        
        break;
      case error instanceof EvalError:
        
        break;
      case error instanceof RangeError:
        
        break;

      // case error instanceof MongoError:
        
      //   break;
    
      default:
        console.log('got an unknown error type');
        return new ErrorInterceptor.ExpectationFailed('got an unknown error type')
    }

    // if(error instanceof ReferenceError) {

    // }
  }

  static async PermissionDenied(action) {
    await this.notification.sendErrorMessage(`Catch permission denied error at ${action}.`)
    return new ErrorInterceptor(403, "Permission denied.")
  }

	static async ServerError(action) {
		await this.notification.sendErrorMessage(`${action} was failed.`)
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
    return new ErrorInterceptor(417, !msg ? "Expectation failed." : msg)
  }

  // ############################################################################################## //
  
}
