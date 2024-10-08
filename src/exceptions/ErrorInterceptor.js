import { MongoError } from "mongodb"
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

  static DefineAndCallAnError(error) {

	  console.log('error instanceof -> ', error instanceof TypeError)

	  if (error instanceof TypeError) {
		  console.log('TypeError');
		  return this.ExpectationFailed(error.message)
	  } else if (error instanceof ReferenceError) {
		  console.log('ReferenceError');
		  return this.ExpectationFailed(error.message)
	  } else if (error instanceof  SyntaxError) {
		  console.log('SyntaxError');
	  }

    // switch (error) {
    //   case error instanceof ReferenceError:
    //     console.log('ReferenceError');
    //     return this.ExpectationFailed(e.message)
    //   // case error instanceof TypeError:
    //   //   console.log('TypeError');
	  //   //   return this.ExpectationFailed(e.message)
		// 	//
    //   //   // break;
    //   case error instanceof SyntaxError:
    //     console.log('SyntaxError');
    //
    //     break;
    //   case error instanceof URIError:
    //     console.log('URIError');
		//
    //     break;
    //   case error instanceof EvalError:
    //     console.log('EvalError');
		//
    //     break;
    //   case error instanceof RangeError:
    //     console.log('RangeError');
    //
    //     break;
		//
    //   case error instanceof MongoError:
    //
    //     break;
	  //   case error instanceof ErrorInterceptor:
		//     console.log('ErrorInterceptor type \n', error);
	  //   break;
		//
    //   default:
    //     console.log('got an unknown error type \n', error);
    //     return this.ExpectationFailed('got an unknown error type')
    // }

    // if(error instanceof ReferenceError) {

    // }
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
