var HttpClient = require('./HttpClient.class');
var fs = require("fs")
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {    
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
             }
          }
       }
   }
   return result;
}

function saveData(_array){

}

function analysisData(html,skipPage){
    var reg="\\/\\*\\*\\/jQuery.*?\\((.*?)\\);";

    var json=html.match(reg)[1];
    var jObject=JSON.parse(json);
    var resultArr=[];
    if(jObject.data.length<=0){
        return false;
    }

    for(var index in jObject.data[0].result){
        jItem=jObject.data[0].result[index]
        jArr=[]
        for (let i in jItem) {
            jArr.push(jItem[i]); //属性
        }
        resultArr.push(jArr.join(','))
    }
    fs.writeFileSync("data.csv",resultArr.join('\r\n'),{flag:'a+'});
    totalPage=jObject.data[0].dispNum
    if((skipPage+50)>=totalPage){
        return false;
    }
    else{
        return true;
    }
}

async function main(){
    //fs.writeFileSync("data.csv","0,0,0,0,0\r\n",{flag:'a+'});

    var idcode=require("./idcode.json");
    var startYear=1960
    var endYear=2005


    var httpClient=new HttpClient();
    httpClient.headers['referer']='https://www.baidu.com';
    httpClient.headers['user-Agent']='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36'
    for(var index in idcode){
        var element=idcode[index]
        if(element.countyId==0){
            continue;
        }
        for(var i=startYear;i<=endYear;i++){
            console.log("正在抓取[{0}]地区[{1}]年失信数据".format(element.provinceName+" "+element.cityName+" "+element.countName,i));
            var skip=0;
            while(true){
                var url="https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?";
                var t=Date.now();
                var idCard=element.id.toString()+i.toString();
                var param= "resource_id=6899&query=%E5%A4%B1%E4%BF%A1%E8%A2%AB%E6%89%A7%E8%A1%8C%E4%BA%BA%E5%90%8D%E5%8D%95&cardNum={0}&iname=&areaName=&pn={1}&rn={2}&ie=utf-8&oe=utf-8&format=json&t={3}&cb=jQuery11020275145608864906_{4}&_={5}"
                .format(
                    idCard,
                    skip,
                    "10",
                    t,t,t
                );
                var r=await httpClient.get(url+param);
                if(r.statusCode==200){
                    if(analysisData(r.body,skip)){
                        skip+=50;
                    }
                    else{
                        break;
                    }
                }
                else{
                    break;
                }
            }
        }
    }
}

main().then(()=>{
    console.log("Over");
});