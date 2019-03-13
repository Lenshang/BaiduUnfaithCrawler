var cookieHelper = require('./utils/CookieHelper')
class HttpClient{
    constructor(){
        this.request=require('request');
        this.headers={
            'Accept-Language': 'zh-CN,zh;q=0.8',
        };
        this.cookie=[];
    }

    updateCookie(_cookie){
        var c = this.cookie.find(item => item["key"]==_cookie["key"]);
        if(!c){
            this.cookie.push(_cookie);
        }
        else{
            this.cookie[this.cookie.indexOf(c)]=_cookie;
        }
    }

    /**
     * 从this.cookie获得所有cookie添加到headers中
     */
    setCookieToHeaders(){
        //写入cookie到headers
        var cookieStr=cookieHelper.dataCookieToString(this.cookie);
        if(cookieStr.length>0){
            this.headers['cookie']=cookieStr;
        }
    }

    /**
     * 从response获得所有的cookie值写入this.cookie
     * @param {} cookieStrs 
     */
    getCookieFromResponse(cookieStrs){
        if(!cookieStrs){
            return;
        }
        cookieStrs.forEach(element => {
            var cookies=cookieHelper.mkdataCookie(element);
            cookies.forEach(el2=>{
                this.updateCookie(el2);
            });
        });
    }

    async get(_url){
        this.setCookieToHeaders();
        return new Promise((resolve,reject)=>{
            this.request({
                url:    _url,   // 请求的URL
                method: 'get',                   // 请求方法
                headers: this.headers
              }, (error, response, body)=>  {
                if (!error) {
                    this.getCookieFromResponse(response.headers['set-cookie']);
                    resolve(response);
                }
                else{
                    reject(error);
                }
              });
        });
    }
    async post(_url,_param){
        this.setCookieToHeaders();
        return new Promise((resolve,reject)=>{
            this.request({
                url:    _url,   // 请求的URL
                method: 'post',
                body:_param,                // 请求方法
                headers: this.headers
              }, (error, response, body)=>  {
                if (!error) {
                    getCookieFromResponse();
                    resolve(response);
                }
                else{
                    reject(error);
                }
              });
        });
    }
}
module.exports=HttpClient;