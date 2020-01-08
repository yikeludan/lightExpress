const http = require("http");
const slice = Array.prototype.slice;

/**
 * author zhoubo
 */

class expClass {
    constructor() {
        this.router = {
            all: [],
            get: [],
            post: []
        }
    }

    register(path) {
        const info = {}
        if (typeof path === 'string') {
            info.path = path;
            //从第二个参数开始 转存为数组存入stack
            info.stack = slice.call(arguments,1)
        } else {
            info.path = '/'
            info.stack = slice.call(arguments,0)
        }
        return info;
    }

    use() {
        const  info = this.register.apply(this,arguments);
        this.router.all.push(info);
    }

    get() {
        const  info = this.register.apply(this,arguments);
        this.router.get.push(info);

    }

    post() {
        const  info = this.register.apply(this,arguments);
        this.router.post.push(info);

    }

    //核心的next机制
    handel(res,req,stack){
        const next = () => {
            //拿到第一个匹配的中间件
            const middleware = stack.shift();
            if(middleware){
                //执行中间件函数
                middleware(req,res,next)
            }
        }
        next();
    }

    match(method,url){
        let stack = [];
        if(url ==='/favicon.ico'){
            return stack;
        }
        let curRouters = []
        curRouters = curRouters.concat(this.router.all);
        curRouters = curRouters.concat(this.router[method]);
        curRouters.forEach(item =>{
            if(url.indexOf(item.path) === 0){
                stack = stack.concat(item.stack)
            }
        })
        return stack;
    }

    callback(){
        return (req,res) =>{
            res.json = (data) =>{
                res.setHeader('Content-type','application/json');
                res.end(
                    JSON.stringify(data)
                )
            }
            const method = req.method.toLowerCase();
            const url = req.url;
            const resultList = this.match(method,url);
            this.handel(res,req,resultList);
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback());
        server.listen(...args)
    }

}


module.exports = () => {
    return new expClass()
}
