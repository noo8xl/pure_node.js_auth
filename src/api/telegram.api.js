import { telegramApi } from "../config/config.js"
import axios from 'axios'


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

  async SendErrorMsg(msg) {
    this.url = `https://api.telegram.org/bot${this.#TOKEN}/sendMessage?chat_id=${this.#ERR_CHAT_ID}&parse_mode=html&text=${encodeURI(msg)}`
    await this.#sendMessage()
  }

  async SendUserMessage(){
    this.url = `https://api.telegram.org/bot${this.#TOKEN}/sendMessage?chat_id=${this.#CHAT_ID}&parse_mode=html&text=${encodeURI(this.#MSG)}`
    await this.#sendMessage()
  }

  async #sendMessage() {
    const config = {
      method: 'GET',
      data: msg,
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

