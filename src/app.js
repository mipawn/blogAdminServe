const Koa = require('koa')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const routers = require('./routers/index')
const config = require('../config')
const session  = require('koa-session-minimal')
const redisStore = require('koa-redis')
const redis = require('./utils/redis')
const log = require('./utils/log')

const app = new Koa()


const logger = async (ctx, next) => {
  log.info(`[uid: ${ctx.session.uid}] ${ctx.request.method}, ${ctx.request.url} `);
  await next()
}

const handle = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.response.status = error.statusCode || error.status || 500
    ctx.response.body = {
      message: error.message
    }
  }
}

// 配置存储session信息的redis
const store = new redisStore({
  client: redis
})

app.use(bodyParser())
app.use(session({
  key: 'SESSION_ID',
  store: store,
  cookie: { // 存放sessionId的cookie配置
    maxAge: 24 * 3600 * 1000,
    expires: '',
    
  }
}))
