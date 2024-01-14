import Express from "express"
import http from 'node:http'
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import { port } from "./src/config/config.js"
import router from "./src/router/index.js"

const app = Express()
const PORT = port
const server = http.createServer(app)


app.use(Express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ type: 'application/*+json' }))
app.disable('x-powered-by')

// routers
app.use('/api', router)

server.listen(PORT, async() => {console.log(`server is running on ${PORT}`)})