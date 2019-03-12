var cookieHelper = require('./utils/CookieHelper')
class HttpClient{
    constructor(){
        this.request=require('request');
        this.headers={
            'Accept-Language': 'zh-CN,zh;q=0.8',
        };
        this.cookie=[];
    }

    UpdateCookie(_cookie){
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
    SetCookieToHeaders(){
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
    GetCookieFromResponse(cookieStrs){
        if(!cookieStrs){
            return;
        }
        cookieStrs.forEach(element => {
            var cookies=cookieHelper.mkdataCookie(element);
            cookies.forEach(el2=>{
                this.UpdateCookie(el2);
            });
        });
    }

    async Get(_url){
        var client=this;
        client.SetCookieToHeaders();
        return new Promise(function(resolve,reject){
            client.request({
                url:    _url,   // 请求的URL
                method: 'GET',                   // 请求方法
                headers: client.headers
              }, function (error, response, body) {
                if (!error) {
                    client.GetCookieFromResponse(response.headers['set-cookie']);
                    resolve(response);
                }
                else{
                    reject(error);
                }
              });
        })
    }
    async Post(_url,_param){
        var client=this;
        client.SetCookieToHeaders();
        return new Promise(function(resolve,reject){
            client.request({
                url:    _url,   // 请求的URL
                method: 'POST',
                body:_param,                // 请求方法
                headers: client.headers
              }, function (error, response, body) {
                if (!error) {
                    client.GetCookieFromResponse();
                    resolve(response);
                }
                else{
                    reject(error);
                }
              });
        })
    }
}
module.exports=HttpClient;