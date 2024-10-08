import Express from "express"
import http from 'node:http'
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import { port, host } from "./src/config/config.js"
import router from "./src/router/index.js"

const app = Express()
const server = http.createServer(app)


app.use(Express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/*+json' }))
app.disable('x-powered-by')

// routers
app.use('/api', router)

server.listen(port, async() => {console.log(`server is running on http://${host}:${port}`)})