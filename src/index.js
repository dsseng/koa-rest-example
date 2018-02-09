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
    .use(helmet())
    .use(cors())
    .use(logger())
    .use(koaBody())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000)