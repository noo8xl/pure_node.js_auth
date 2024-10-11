import Express from "express"
import http from 'node:http'
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import { port, host } from "./src/config/config.js"
import router from "./src/router/index.js"

const app = Express()


app.use(Express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/*+json' }))
app.disable('x-powered-by')

// routers
app.use('/api', router)

http
	.createServer(app)
	.listen(
		port,
		host,
		() => console.log(`server is running on http://${host}:${port}`)
	)