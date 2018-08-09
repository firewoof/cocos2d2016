/*
 ** by lex
 */

var Http =  cc.Class.extend({
    m_inst : null, //实例
    url : "http://127.0.0.1:8080/request.php",

    ctor : function(){
    },

    /*
     * 网络请求
     * url 请求的网络地址
     * callback 回调参数
     * postData post请求参数  ("id=1&id=2&id=3")
     * */
    requestWithUrl : function(url, onComplete, onError, onProgress, onTimeOut, timeoutTimeInMS, method, postData, responseType){
        if(!method || method.toUpperCase() == "GET" || method.toLowerCase() == "undefined"){
            method = "GET";
        }
        else {
            method = "POST";
        }

        if(!responseType || responseType.toLowerCase() == "arraybuffer" || responseType.toLowerCase() == "undefined"){
            responseType = "arraybuffer";
        }

        cc.log("requestWithUrl", responseType);
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.responseType = responseType;
        xhr.open(method, url, true);

        xhr.timeout = timeoutTimeInMS || (5*1000);
        xhr["onerror"] = function() {
            cc.log("onerror");
            if(onError)
                onError(xhr.responseText);
        };
        xhr["onload"] = function() {
            cc.log("onload");
            if(onProgress)
                onProgress(xhr.response);
        };
        xhr["ontimeout"] = function(){
            cc.log("ontimeout");
            if(onTimeOut)
                onTimeOut(xhr.responseText);
        };
        xhr["onloadend"] = function () {
            cc.log("onloadend");//, xhr.response);
            var response = xhr.response;
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                if(onComplete)
                    onComplete(response, url);
            }
            else{
                onError(response);
            }
        };
        if(postData)
            xhr.send(postData);
        else
            xhr.send();
    }
});

//获取实例
Http.getInstance = function() {
    if (Http.m_inst == null) {
        Http.m_inst = new Http();
    }
    return Http.m_inst;
};
