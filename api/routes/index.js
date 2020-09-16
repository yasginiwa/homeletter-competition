const router = require('koa-router')()
const request = require('request')
const db = require('../modules/db')
const format = require('date-format')

/**
 * 获取小程序openid
 */
router.post('openid', async (ctx, next) => {
    const appid = 'wx8a26ee48db5fb5f3',
        secret = 'f10ba940935a81f9a05f67be8f368e2e',
        js_code = ctx.request.body.js_code.code,
        grant_type = 'authorization_code',
        url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=${grant_type}`;

    /**
     * 给TX发出请求 请求openid
     */
    let getTencentID = () => {
        return new Promise((resolve, reject) => {
            request(url, (err, res) => {
                if (!err && res.statusCode === 200) {
                    resolve(res);
                } else {
                    reject(err);
                }
            })
        })
    }

    /**
     * await同步 等待请求完成返回给客户端
     */
    await getTencentID()
        .then(
            (data) => {
                let bodyObj = JSON.parse(data.body);
                ctx.response.body = {
                    meta: {
                        status: 200,
                        msg: '获取openid成功',
                    },
                    data: { openid: bodyObj.openid }
                }
            }
        )
        .catch(
            (err) => {
                ctx.response.body = {
                    meta: {
                        status: 401,
                        msg: 'error',
                    },
                    data: err
                }
            }
        )

    next()
})

//  查询此openid用户是否有写过一封家书
router.get('letter', async (ctx, next) => {

    const openid = ctx.query.openid

    const res = await db.query(`select * from t_letter where openid='${openid}'`)

    ctx.response.body = {
        meta: {
            status: 200,
            msg: '获取一封家书成功'
        },
        data: {
            result: res
        }
    }

    next()
})

//  提交一封家书
router.post('addletter', async (ctx, next) => {

    const { openid, name, gender, mobile, content } = ctx.request.body

    const res = await db.query(`insert into t_letter values (default, '${openid}', '${name}', '${gender}', '${mobile}', '${content}', default)`)

    ctx.response.body = {
        meta: {
            status: 201,
            msg: '提交一封家书成功'
        },
        data: {
            result: res
        }
    }

    next()
})

//  后台管理登录
router.post('login', async (ctx, next) => {
    const { username, password } = ctx.request.body

    const pwdResult = await db.query(`select password from t_user where username = '${username}'`)

    //  查询到的用户数为0 代表无此用户
    if (pwdResult.length === 0) {

        ctx.response.body = {
            meta: {
                status: 401,
                msg: '用户名不存在'
            }
        }
        return
    }

    if (pwdResult[0].password !== password) {

        ctx.response.body = {
            meta: {
                status: 402,
                msg: '用户名或密码错误'
            }
        }
    } else {

        ctx.response.body = {
            meta: {
                status: 200,
                msg: '登录成功'
            }
        }
    }

    next()

})

//  后台查询信件详情
router.get('getletters', async (ctx, next) => {


    let { pagenum, pagesize} = ctx.query
    
    //  参数转换为整数
    pagenum = pagenum - 0
    pagesize = pagesize - 0

    if (!pagenum || pagenum <= 0) {
        ctx.response.body = {
            meta: {
                status: 400,
                msg: '参数错误'
            }
        }
    }

    if (!pagesize || pagesize <= 0) {
        ctx.response.body = {
            meta: {
                status: 400,
                msg: '参数错误'
            }
        }
    }

    const total = await db.query(`select count(*) as count from t_letter`)

    const startFrom = (pagenum - 1) * pagesize

    const res = await db.query(`select * from t_letter limit ${startFrom}, ${pagesize}`)

    ctx.response.body = {
        meta: {
            status: 200,
            msg: '获取信件信息成功'
        },
        data: { result: res, total: total[0].count }
    }

    next()

})

//  获取所有信件信息
router.get('getallletters', async(ctx, next) => {

    const res = await db.query(`select lid, name, gender, mobile, content from t_letter`)

    ctx.response.body = {
        meta: {
            status: 200,
            msg: '获取所有信件信息成功'
        },
        data: { result: res }
    }

    next()

})

module.exports = router.routes()