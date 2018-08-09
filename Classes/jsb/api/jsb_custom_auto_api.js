/**
 * @module custom
 */
var cs = cs || {};

/**
 * @class NativeTool
 */
cs.NativeTool = {

/**
 * @method generateAESKey
 * @return {String}
 */
generateAESKey : function (
)
{
    return ;
},

/**
 * @method AESEncryt
 * @param {String} arg0
 * @param {char} arg1
 * @return {String}
 */
AESEncryt : function (
str, 
char 
)
{
    return ;
},

/**
 * @method openPhoto
 * @param {function} arg0
 */
openPhoto : function (
func 
)
{
},

/**
 * @method getCurMillSecs
 * @return {double}
 */
getCurMillSecs : function (
)
{
    return 0;
},

/**
 * @method downloadImage
 * @param {String} arg0
 * @param {function} arg1
 */
downloadImage : function (
str, 
func 
)
{
},

/**
 * @method AESDecryt
 * @param {String} arg0
 * @param {char} arg1
 * @return {String}
 */
AESDecryt : function (
str, 
char 
)
{
    return ;
},

/**
 * @method openCamera
 * @param {function} arg0
 */
openCamera : function (
func 
)
{
},

/**
 * @method getClockTick
 * @return {double}
 */
getClockTick : function (
)
{
    return 0;
},

/**
 * @method stringByMD5
 * @param {String} arg0
 * @return {String}
 */
stringByMD5 : function (
str 
)
{
    return ;
},

/**
 * @method NativeTool
 * @constructor
 */
NativeTool : function (
)
{
},

};

/**
 * @class GameFileUtils
 */
cs.GameFileUtils = {

/**
 * @method getFileListInPath
 * @return {Array}
 */
getFileListInPath : function (
)
{
    return new Array();
},

/**
 * @method getFileList
 * @param {String} arg0
 * @param {Array} arg1
 * @param {bool} arg2
 * @return {Array}
 */
getFileList : function (
str, 
array, 
bool 
)
{
    return new Array();
},

/**
 * @method writeStringToFile
 * @param {String} arg0
 * @param {String} arg1
 * @param {String} arg2
 * @return {int}
 */
writeStringToFile : function (
str, 
str, 
str 
)
{
    return 0;
},

/**
 * @method createPath
 * @param {String} arg0
 * @return {int}
 */
createPath : function (
str 
)
{
    return 0;
},

/**
 * @method writeFile
 * @param {String} arg0
 * @param {cc.Data} arg1
 * @param {String} arg2
 * @return {int}
 */
writeFile : function (
str, 
data, 
str 
)
{
    return 0;
},

/**
 * @method removeAllFiles
 * @param {String} arg0
 */
removeAllFiles : function (
str 
)
{
},

/**
 * @method getFileNameListInPath
 * @param {String} arg0
 * @param {bool} arg1
 * @return {Array}
 */
getFileNameListInPath : function (
str, 
bool 
)
{
    return new Array();
},

/**
 * @method deleteFile
 * @param {String} arg0
 * @return {int}
 */
deleteFile : function (
str 
)
{
    return 0;
},

/**
 * @method getWritablePath
 * @return {String}
 */
getWritablePath : function (
)
{
    return ;
},

/**
 * @method GameFileUtils
 * @constructor
 */
GameFileUtils : function (
)
{
},

};

/**
 * @class NetworkManager
 */
cs.NetworkManager = {

/**
 * @method tryConnectToServer
 * @param {String} arg0
 * @param {unsigned short} arg1
 * @return {int}
 */
tryConnectToServer : function (
str, 
short 
)
{
    return 0;
},

/**
 * @method check_heartbeat
 * @param {long long} arg0
 * @param {long long} arg1
 */
check_heartbeat : function (
long long, 
long long 
)
{
},

/**
 * @method disconnect
 */
disconnect : function (
)
{
},

/**
 * @method setAESKEY
 * @param {String} arg0
 * @param {String} arg1
 */
setAESKEY : function (
str, 
str 
)
{
},

/**
 * @method getRequestData
 */
getRequestData : function (
)
{
},

/**
 * @method connectToServer
 * @param {String} arg0
 * @param {unsigned short} arg1
 */
connectToServer : function (
str, 
short 
)
{
},

/**
 * @method dispatchAndReleaseAllEvent
 */
dispatchAndReleaseAllEvent : function (
)
{
},

/**
 * @method onReceiveData
 * @param {cc.Data} arg0
 */
onReceiveData : function (
data 
)
{
},

/**
 * @method dispatchEventSafe
 * @param {String} arg0
 * @param {String} arg1
 */
dispatchEventSafe : function (
str, 
str 
)
{
},

/**
 * @method changeEncrytKey
 * @param {String} arg0
 */
changeEncrytKey : function (
str 
)
{
},

/**
 * @method check_keepalived
 * @param {long long} arg0
 * @param {long long} arg1
 * @return {bool}
 */
check_keepalived : function (
long long, 
long long 
)
{
    return false;
},

/**
 * @method addRequest
 * @param {String} arg0
 */
addRequest : function (
str 
)
{
},

/**
 * @method NetworkManager
 * @constructor
 */
NetworkManager : function (
)
{
},

};

/**
 * @class EventGame
 */
cs.EventGame = {

/**
 * @method getStrData
 * @return {String}
 */
getStrData : function (
)
{
    return ;
},

/**
 * @method setStrData
 * @param {String} arg0
 */
setStrData : function (
str 
)
{
},

/**
 * @method EventGame
 * @constructor
 * @param {String} arg0
 */
EventGame : function (
str 
)
{
},

};
