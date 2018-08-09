/**
 * Created on 16-11-12.
 */

var REQUEST_SUBSCRIBE_QUOTE = "MARKET_TOPIC";    //订阅行情
var REQUEST_HEARTBEAT = "HEARTBEAT";             //心跳
var REQUEST_LOGIN = "AUTH";                      //认证登录


/**
 * Request
 */
var Request = cc.Class.extend({
	_rqstType: undefined,
	_jsonData: undefined,

    ctor:function(){
        this._jsonData = {};
    }
});

Request.prototype.getRqstType = function() {
	return this._rqstType;
};

Request.prototype.getJsonData = function() {
	return this._jsonData;
};

Request.prototype.setJsonDataProp = function(props) {
	if(!this._jsonData){
		this._jsonData = {};
	}
	for(var key in props){
		this._jsonData[key] = props[key];
	}
};

Request.prototype.toJson = function() {
	return JSON.stringify({action:this._rqstType, data:this._jsonData})
};


/**
 * SocketRequest
 */
var SocketRequest = SocketRequest || { };

/**
 * 登录认证
 */
SocketRequest.loginAuth = function(token) {
    var request = new Request();
    request._rqstType = REQUEST_LOGIN;
    request._jsonData = {
        "acct":token
    };

    //特殊请求 不能用Manager sendRequest
    cs.NetworkManager.addRequest(request.toJson());
};

/**
 * 心跳
 */
SocketRequest.heartBeat = function() {
    var request = new Request();
    request._rqstType = REQUEST_HEARTBEAT;

    SocketManager.getInstance().sendRequest(request);
};

/**
 * 订阅行情
 * @param token
 */
SocketRequest.subscribeQuote = function(productId) {
    var request = new Request();
    request._rqstType = REQUEST_SUBSCRIBE_QUOTE;
    request._jsonData = {
        "pid":productId
    };

    SocketManager.getInstance().sendRequest(request);
};
