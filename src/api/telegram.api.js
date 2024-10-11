import { telegramApi } from "../config/config.js"
import axios from 'axios'


// Telegram -> handle errors and 2fa messages use telegram API
export class Telegram {
  #TOKEN = telegramApi.token
  #ERR_CHAT_ID = telegramApi.chatId
  #CHAT_ID
  #MSG
  url = `https://api.telegram.org/bot${'telegram token here'}/sendMessage?chat_id=${'user chat id here'}&parse_mode=html&text=${'your message here'}`

  constructor(dto) {
    this.#CHAT_ID = dto.chatId
    this.#MSG = dto.msg
  }

  // SendErrorMsg -> send ONLY error messages to the developer CHAT_ID
  async SendErrorMsg() {
    this.url = `https://api.telegram.org/bot${this.#TOKEN}/sendMessage?chat_id=${this.#ERR_CHAT_ID}&parse_mode=html&text=${encodeURI(this.#MSG)}`
    await this.#sendMessage()
  }

  // SendUserMessage -> handle user messages as 2fa code, etc.
  async SendUserMessage(){
    this.url = `https://api.telegram.org/bot${this.#TOKEN}/sendMessage?chat_id=${this.#CHAT_ID}&parse_mode=html&text=${encodeURI(this.#MSG)}`
    await this.#sendMessage()
  }

  
  // #######################################################################
  // ######################## private methods area #########################
  // #######################################################################

  // sendMessage -> send a message with params to the user via http
  async #sendMessage() {
    const config = {
      method: 'GET',
      data: this.#MSG,
      responseType: 'stream'
    }

    const handleResponse = (res) => {console.log(res.status)}

    const handleError = (e) => {
      e.response
        ? console.log(e.response.data)
        : console.error(e.message)
    }

    await axios(this.url, config)
      .then(handleResponse)
      .catch(handleError)  
  }

}

