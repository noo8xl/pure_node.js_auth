import * as nodemailer from 'nodemailer'
import { emailCient, apiUrl } from '../config/config.js'

// NotificationService -> implements email and 
// telegram API notifications services.
// here it is just a sample (it works), but it 
// available to bit refactor to use via another repo
// called <notification-api> -->  https://github.com/noo8xl/notification-api
class NotificationService {
  #SMTP_HOST = emailCient.host
  #SMTP_PORT = emailCient.port
  #SMTP_USER =  emailCient.user
  #SMTP_PASSWORD = emailCient.password
  #API_URL = apiUrl
  #transporter

  constructor() {
    this.#transporter = nodemailer.createTransport({
      host: this.#SMTP_HOST,
      port: this.#SMTP_PORT,
      secure: false,
      auth: {
        user: this.#SMTP_USER,
        pass: this.#SMTP_PASSWORD
      }
    })
  }

  async sendActivationMail(to, link) {
    await this.#transporter.sendMail({
      from: this.#SMTP_USER,
      to: to,
      subject: 'Account activation',
      text: '',
      html:
        `
          <div>
            <h1>Click to activate: </h1>
            <a href='${link}'>${link}</a>
          </div>
        `
    })
    this.#transporter
      .verify()
      .then(console.log)
      .catch(console.error);

    return
  }

  async send2faEmailCode(email, code){
    await this.#transporter.sendMail({
      from: this.#SMTP_USER,
      to: email,
      subject: 'Authentication',
      text: '',
      html:
        `
          <div>
            <h1>Authentication code: </h1>
            <div>${code}</div>
          </div>
        `
    })
    this.#transporter
    .verify()
    .then(console.log)
    .catch(console.error);

    return
  }

  async send2faTelegramCode(chatId, code){

    // send code to tg here < --
    console.log("data -> ", chatId, code);

    return
  }

}

export default new NotificationService();