import * as nodemailer from 'nodemailer'
import { emailClient, apiUrl } from '../../config/config.js'
import { Telegram } from '../../api/telegram.api.js'

// NotificationService -> implements email and 
// telegram API notifications services.
// here it is just a sample (it works), but it 
// available to bit refactor to use via another repo
// called <notification-api> -->  https://github.com/noo8xl/notification-api

export class NotificationService {
  #SMTP_HOST = emailClient.host
  #SMTP_PORT = emailClient.port
  #SMTP_USER =  emailClient.user
  #SMTP_PASSWORD = emailClient.password
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
	  console.log(`sent email to ${to}: ${link}`);
    // await this.#transporter.sendMail({
    //   from: this.#SMTP_USER,
    //   to: to,
    //   subject: 'Account activation',
    //   text: '',
    //   html:
    //     `
    //       <div>
    //         <h1>Click to activate: </h1>
    //         <a href='${link}'>${link}</a>
    //       </div>
    //     `
    // })
    // this.#transporter
    //   .verify()
    //   .then(console.log)
    //   .catch(console.error);
  }

  async send2faEmailCode(to, code){
	  console.log(`sent email to ${to}: ${code}`);
    // await this.#transporter.sendMail({
    //   from: this.#SMTP_USER,
    //   to: email,
    //   subject: 'Authentication',
    //   text: '',
    //   html:
    //     `
    //       <div>
    //         <h1>Authentication code: </h1>
    //         <div>${code}</div>
    //       </div>
    //     `
    // })
    // this.#transporter
    // .verify()
    // .then(console.log)
    // .catch(console.error);
  }

  async send2faTelegramCode(chatId, code){
    await new Telegram({chatId, msg: code}).SendUserMessage()
  }

  async sendTelegramErrorMessage(msg) {
    await new Telegram({chatId: null, msg}).SendErrorMsg()
  }





}

export default NotificationService;