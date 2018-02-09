import Koa from 'koa'
import koaBody from 'koa-body'
import Router from 'koa-router'
import logger from 'koa-logger'
import cors from '@koa/cors'
import helmet from 'koa-helmet'
import JsonDB from 'node-json-db'

const app = new Koa()
const router = new Router()

let db = new JsonDB("db.json", true, false)

router
    .post('/', ctx => {
        db.push('/items[]', ctx.request.body, true)
        ctx.body = db.getData('/items')
    })
    .get('/', ctx => {
        ctx.body = db.getData('/items')
    })

app
    .use(helmet()) // Some safety
    .use(cors()) // CORS 
    .use(logger()) // morgan-like logger
    .use(koaBody()) // body-parser for koa
    .use(router.routes()) // Router
    .use(router.allowedMethods())
    .listen(3000) // Or use http(s) server with app.callback()