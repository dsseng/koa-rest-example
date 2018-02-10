import Koa from 'koa'
import koaBody from 'koa-body'
import Router from 'koa-router'
import logger from 'koa-logger'
import cors from '@koa/cors'
import helmet from 'koa-helmet'
import JsonDB from 'node-json-db'
import jwt from 'jsonwebtoken'

const app = new Koa()
const router = new Router()

let db = new JsonDB('db.json', true, false)

async function auth (ctx, next) {
    if (ctx.request.body.token) {
        jwt.verify(ctx.request.body.token, 'shared secret', (err, payload) => {
            if (err) {
                ctx.throw(401)
            } else {
                ctx.payload = payload
                next()
            }
        })
    }
}

router
    .post('/reg', ctx => {
        const data = ctx.request.body
        if (data.username && data.password) {
            let user = {
                username: data.username,
                password: data.password
            } // Hash password in real projects!!!

            db.push('/users[]', user, true)

            ctx.body = {
                code: 200,
                user: user
            }
        }
    })
    .post('/login', ctx => {
        const data = ctx.request.body
        if (data.username && data.password) {
            const users = db.getData('/users')
            const user = users.find(user => {
                if (user.username === data.username) {
                    return true
                } else {
                    return false
                }
            })
            if (user && data.password === user.password) {
                ctx.body = {
                    code: 200,
                    token: jwt.sign({ username: user.username }, 'shared secret', { expiresIn: 60 * 60 })
                }
            } else {
                ctx.throw(401)
            }
        }
    })
    .post('/', auth, ctx => {
        db.push('/items[]', { data: ctx.request.body.data, user: ctx.payload.username }, true)
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