const Koa = require('koa')
const router = require('koa-router')()
const routes = require('./routes/index')
const bodyParser = require('koa-bodyparser')
const https = require('https')
const fs = require('fs')

//  https密钥配置选项
let options = {
    key: fs.readFileSync('cert/article.hgsp.cn.key', 'utf-8'),
    cert: fs.readFileSync('cert/article.hgsp.cn.pem', 'utf-8')
};
    
let app = new Koa()

app.use(bodyParser())

router.use('/', routes)

app.use(router.routes())
    .use(router.allowedMethods())


//  http服务
// app.listen(10449)

//  https服务
https.createServer(options, app.callback()).listen(10449)