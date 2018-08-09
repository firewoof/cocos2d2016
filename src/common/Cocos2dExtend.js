/**
 * Created by lingying on 2016/5/5.
 */

//---------------------js原生对象扩展------------------
if(!Array.prototype.last){
    Array.prototype.last = function(idx)
    {
        var idx = idx || 0;
        if(this.length == 0)
            return undefined;
        return this[this.length - 1 - idx]
    };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (prefix){
        return this.slice(0, prefix.length) === prefix;
    };
}

//判断当前字符串是否以str结束
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };
}

/**
 * 计算字符宽度汉子占两个字母数字占一个
 */
if(!String.prototype.getCharLen) {
    String.prototype.getCharLen = function getCharLen(val) {
        var realLength = 0, len = this.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = this.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;
            else realLength += 2;
        }
        return realLength;
    }
}

//截取字符串 包含中文处理
//(串,长度,增加...)
String.prototype.subStrCH = function(start, len, hasDot)
{
    var len = len == undefined ? 99999 : len;
    var str = this;
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex, "**").length;
    var end = start;
    for(var i = start;i < strLength;i++)
    {
        end = i;
        singleChar = str.charAt(i).toString();
        if(singleChar.match(chineseRegex) != null)
        {
            newLength += 2;
        }
        else
        {
            newLength++;
        }
        if(newLength > len)
        {
            break;
        }
        newStr += singleChar;
    }

    //if(hasDot && strLength > len)
    //{
    //    newStr += "...";
    //}
    return {"str":newStr, "end":end};
}

//String.prototype.subStrCH = function(star,len){
//    var str = this;
//    var char_length = 0;
//    for (var i = 0; i < str.length; i++){
//        var son_str = str.charAt(i);
//        encodeURI(son_str).length > 2 ? char_length += 1 : char_length += 0.5;
//        if (char_length >= len){
//            var sub_len = char_length == len ? i+1 : i;
//            return str.substr(0, sub_len);
//            break;
//        }
//    }
//}

/**
 * 从右侧截取i个字符
 */
if(!String.prototype.Right) {
    String.prototype.Right = function (i) { //为String对象增加一个Right方法
        return this.slice(this.length - i, this.length)
    }
}

/**
 * 获取字符串长度 英文算一个 中文算两个
 */
if(!String.prototype.gblen) {
    String.prototype.gblen = function() {
        var len = 0;
        for (var i=0; i<this.length; i++) {
            if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {
                len += 2;
            } else {
                len ++;
            }
        }
        return len;
    }
}

/**
 * 取精度，不四捨五入
 * @constructor
 */
Number.prototype.toFixedCs = function(fNum)
{
    var temp = this.toFixed(fNum);
    if(fNum == 0){
        return parseInt(this);
    }
    return temp.substring(0, temp.lastIndexOf('.')+fNum+1);
};

cc.sizeAdd = function(size, addSize)
{
  return cc.size(size.width + addSize.width, size.height + addSize.height);
};

cc.pCenter = function(size)
{
    return cc.p(size.width * 0.5, size.height * 0.5);
};

cc.pRightTop = function(size)
{
    return cc.p(size.width, size.height);
};

//-------------------cc.Node的扩展--------------------------
/**
 * 以锚点相对布局(不会修改node锚点)
 * @param position      (想要设置的位置)
 * @param [anchorPoint]   (以哪个锚点设置位置)
 */
cc.Node.prototype.setPos = function(position, anchorPoint) {
    var anchorPoint = anchorPoint || cc.p(0.5, 0.5);
    var nodeAnchorPoint = this.getAnchorPoint();
    if(this.isIgnoreAnchorPointForPosition()){
        nodeAnchorPoint = cc.p(0, 0);
    }
    var size = this.getBoundingBox();
    var width = size.width;
    var height = size.height;
    var offsetX = (nodeAnchorPoint.x - anchorPoint.x) * width;
    var offsetY = (nodeAnchorPoint.y - anchorPoint.y) * height;
    this.setPosition(cc.p(position.x + offsetX, position.y + offsetY));
};

/**
 * x偏移设置
 * @param value
 */
cc.Node.prototype.setPositionXAdd = function(value){
    this.setPositionX(this.getPositionX() + value);
};

/**
 * y偏移设置Y
 * @param value
 */
cc.Node.prototype.setPositionYAdd = function(value){
    this.setPositionY(this.getPositionY() + value);
};

/**
 * 递归所有子节点 使其透明度都能传递
 */
cc.Node.prototype.setCascadeOpacityAll = function()
{
    var children = this.getChildren();
    for(var i = 0; i < children.length; i++){
        var child = children[i];
        child.setCascadeOpacityEnabled(true);
        child.setCascadeOpacityAll();
    }
};

/**
 * 获取节点在任意祖先节点上的位置
 * @param {*|cc.Node} ancestorNode
 * @param {*|cc.Point} [visualAnchorPoint]  你想要以node的那个锚点计算位置(默认结果是以node本身锚点返回坐标)
 * returns {cc.Point}
 */
cc.Node.prototype.getPosAtAncestor = function(ancestorNode, visualAnchorPoint){
    if(ancestorNode == undefined) return;
    var nodePoint = cc.p(0, 0);
    if(visualAnchorPoint){
        var boundingBox = this.getBoundingBox();
        var anchorPoint = this.getAnchorPoint();
        nodePoint = cc.p(boundingBox.width * (visualAnchorPoint.x - anchorPoint.x), boundingBox.height * (visualAnchorPoint.y - anchorPoint.y));
    }
    var position = ancestorNode.convertToNodeSpace(this.convertToWorldSpaceAR(nodePoint));
    return position;
};

/**
 *
 * @param location
 * @returns {Boolean|*}
 */
cc.Node.prototype.isContainPoint = function(location){
    var size = this.getContentSize();
    var rectObj =cc.rect(0,0,size.width,size.height);
    var pos = this.convertToNodeSpace(location);
    var result = cc.rectContainsPoint(rectObj,pos);
    size=null;
    rectObj = null;
    pos=null;
    return result;
};

/**
 * 为ccNode添加touch事件
 * @param func
 * @param [isSwallowTouch]
 */
cc.Node.prototype.addTouchEventListenerOneByOne = function(func, isSwallowTouch, isTouchAnimateEnable){
    this._touchCallBack = func;
    this._isTouchAnimateEnable = isTouchAnimateEnable;  //点击时是否执行缩放动画
    //默认吞掉事件
    if(isSwallowTouch == undefined){
        isSwallowTouch = true;
    }
    //默认有点击的缩放动画
    if(isTouchAnimateEnable == undefined){
        this._isTouchAnimateEnable = true;
    }

    //重复添加时 只会更换回调不做listener移除
    if(this._touchEventListener != undefined){
        this._touchCallBack = func;
        this._touchEventListener.setSwallowTouches(isSwallowTouch);
        return this._touchEventListener;
    }
    this._originScaleX = this.getScaleX();
    this._originScaleY = this.getScaleY();
    var listenerJson = {
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: isSwallowTouch,

        onTouchBegan: onTouchBeganOneByOneFunction,
        onTouchEnded: onTouchEndedOneByOneFunction

    };

    this._touchEventListener = cc.eventManager.addListener(listenerJson, this);
    return this._touchEventListener;
};

var onTouchBeganOneByOneFunction = function(touch, event) {
    var currentNode = event.getCurrentTarget();
    //自身及父节不可见时
    if(currentNode.isVisible() === false){
        return false;
    }
    for(var parent = currentNode.getParent(); parent != null; parent = parent.getParent()){
        if(parent.isVisible() === false){
            parent = null;
            return false;
        }
        if(parent instanceof ccui.ScrollView){
            var pos = touch.getLocation();
            if(!parent.isContainPoint(pos)){
                return false;
            }
        }
    }
    parent=null;
    var isOnTouch = UICommon.isOnTouch(touch, event);

    if(isOnTouch == true && currentNode._isTouchAnimateEnable){
        var touchSprite = currentNode;
        if(currentNode._touchSprite){
            touchSprite = currentNode._touchSprite;
        }
        touchSprite.runAction(cc.sequence(cc.scaleTo(0.15, currentNode.getScaleX() * 1.1, currentNode.getScaleY() * 1.1)));
    }
    return isOnTouch;
};

var onTouchEndedOneByOneFunction = function(touch, event) {
    var currentNode = event.getCurrentTarget();
    if(currentNode._isTouchAnimateEnable){
        var touchSprite = currentNode;
        if(currentNode._touchSprite){
            touchSprite = currentNode._touchSprite;
        }
        touchSprite.runAction(new cc.Sequence(new cc.ScaleTo(0.15, currentNode._originScaleX, currentNode._originScaleY)));
    }
    if((this.swallowTouches === true && UICommon.isOnTouch(touch, event)) || (this.swallowTouches === false && UICommon.isOnTouchWithDistance(touch, 35))){
        MainController.playButtonSoundEffect(currentNode);
        if(currentNode._touchCallBack && currentNode._touchCallBack instanceof Function)
        {
            currentNode._touchCallBack(currentNode);
        }
    }
};

/**
 * 将指定node以及其children的shaderProgram设置为指定
 * @param {cc.GLProgram} shaderProgram 例：cc.shaderCache.getProgram("ShaderPositionTextureColorGray"),恢复原色: "ShaderPositionTextureColor_noMVP"
 * @param {Number} [exclusive]  例外的node.getTag
 */
cc.Node.prototype.setShaderRecursive = function(shaderProgram, exclusive) {
    var children = this.getChildren();
    for (var i = 0, l = children.length; i < l; ++i) {
        if (typeof exclusive != "undefined" && children[i].getTag() == exclusive) {
            continue;
        }
        children[i].setShaderRecursive(shaderProgram, exclusive);
    }

    if(this instanceof cc.Sprite || this instanceof cc.Scale9Sprite){
        this.setShaderProgram(shaderProgram);
    }
};

/**
 * 将指定node以及其children的shaderProgram设置为指定
 * @param {cc.Node | ccui.Widget | *} node
 * @param {Number} [exclusive]  例外的node.getTag
 */
cc.Node.prototype.resumeColorRecursive = function(exclusive) {
    var children = this.getChildren();
    for (var i = 0, l = children.length; i < l; ++i) {
        if (typeof exclusive != "undefined" && children[i].getTag() == exclusive) {
            continue;
        }
        children[i].setShaderRecursive(cc.shaderCache.getProgram("ShaderPositionTextureColor_noMVP"), exclusive);
    }

    this.setShaderProgram(cc.shaderCache.getProgram("ShaderPositionTextureColor_noMVP"));
};

/**
 * 设置自定义触摸事件是否可用
 * @param bool
 */
cc.Node.prototype.setTouchEventEnabled = function(bool){
    //表示只为了禁止触摸穿透(onTouchBegan一定要返回true 否则会穿透)
    if(this._touchEventListener == undefined){
        var listenerJson = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {
                if(this.isVisible() === false){
                    return false;
                }
                for(var parent = this.getParent(); parent != null; parent = parent.getParent()){
                    if(parent.isVisible() === false) return false;
                }
                return UICommon.isOnTouch(touch, event);
            }.bind(this)
        };
        this._touchEventListener = cc.eventManager.addListener(listenerJson, this);
    }else{
        this._touchEventListener.setEnabled(bool);
    }
};

/**
 * 移除一个node相关的所有notify监听(一般请在界面关闭cleanup中调用)
 */
cc.Node.prototype.removeAllCustomListeners = function(){
    for(var prop in this){
        if(this[prop] instanceof cc.EventListener){
            cc.eventManager.removeListener(this[prop]);
            this[prop] = null;
        }
    }
};

/**------------end---------------

//--------------------------其他扩展-------------------------------

/**
 * panel的背景颜色
 * @param [color]
 */
ccui.Layout.prototype.setBackGroundColorEx = function(color){
    this.setBackGroundColor(color || cc.RED);
    this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
};

/**
 * 注意 请确保子节点顺序
 * (经常出现此类需求: 修改label内容后 需要动态调整与其他同层节点到间距)
 * arrangeChild equals gap
 * @param color
 * @param children children 需要保证子节点从左至右排版   ##node.getChildren不能保证这个（它跟loacalZorder相关）
 */
ccui.Widget.prototype.arrangeChildrenCenter = function(gap, children) {
    var children = children || this.getChildren();
    var size = this.getContentSize();
    var childrenWidth = 0;
    var gap = gap || 0;
    //默认应用最广的排版 居中模式
    for(var i = 0; i < children.length; i++) {
        var child = children[i];
        childrenWidth += child.getContentSize().width;
    }
    var leftPadding = (size.width - childrenWidth - gap * (children.length - 1)) * 0.5;
    //cc.log("leftPadding::", leftPadding);

    //排版
    var xCount = leftPadding;
    for(var i = 0; i < children.length; i++) {
        var child = children[i];

        //无视锚点布局 X
        var nodeAnchorPoint = child.getAnchorPoint();
        if(this.isIgnoreAnchorPointForPosition()){
            nodeAnchorPoint = cc.p(0, 0);
        }
        var width = child.getContentSize().width;
        var offsetX = (nodeAnchorPoint.x - 0) * width;
        var xPos = 0;
        if(0 == i){
            xPos = xCount + offsetX;
            child.setPositionX(xPos);
        }else{
            xPos = xCount + offsetX + gap;
            child.setPositionX(xPos);
        }
//        cc.log("xPos::",xPos);
        xCount += width + gap;

    }
};

/**
 * @param {cc.Size} s1
 * @param {cc.Size} s2
 * @return {cc.Size}
 */
cc.sizeAdd = function(s1, s2) {
    return cc.size(s1.width + s2.width, s1.height + s2.height);
};

/**
 * @param {cc.Size} s1
 * @param {cc.Size} s2
 * @return {cc.Size}
 */
cc.sizeSub = function(s1, s2) {
    return cc.size(s1.width - s2.width, s1.height - s2.height);
};

/**
 *求两点直线之间任意一点 已知y求x
 */
cc.anyXInLine = function(point1, point2, y)
{
    //两点式:(x-x1)/(x2-x1)=(y-y1)/(y2-y1)
    //(x - point1.x) / (point2.x - point1.x) = (y - point1.y) / (point2.y - point1.y)
    //若与坐标轴垂直
    if(point1.x == point2.x || point1.y == point2.y)
        cc.error("线不能与坐标轴垂直");
    else
        return  (y - point1.y) / (point2.y - point1.y) * (point2.x - point1.x) + point1.x;
};

/**
 *求两点直线之间任意一点 已知x求y
 */
cc.anyYInLine = function(point1, point2, x)
{
    if(point1.x == point2.x || point1.y == point2.y)
        cc.error("线不能与坐标轴垂直");
    else
        return (x - point1.x) / (point2.x - point1.x) * (point2.y - point1.y) + point1.y;
};

//-----------------------------drawNode扩展-------------------------------
/**
 * 画虚线（直线）
 * @param point1
 * @param point2
 * @param lineWidth
 * @param color
 */
cc.DrawNode.prototype.drawDottedLine = function(point1, point2, lineWidth, color)
{
    //lineLen
    this.clear();
    var xDiff = point2.x - point1.x;
    var yDiff = point2.y - point1.y;
    var lineLen = Math.sqrt(xDiff * xDiff + yDiff * yDiff); //两点之间直线长度
    var isUpToX = true;         //是否以x来取点
    var isVerticalLine = false; //直线是否垂直坐标系

    //垂直y轴
    if(parseInt(point1.x) == parseInt(point2.x))
    {
        isUpToX = false;
        isVerticalLine = true;
    }
    else if(parseInt(point1.y) == parseInt(point2.y))
    {
        isUpToX = true;
        isVerticalLine = true;
    }
    else
    {
        //倾斜
        if(Math.abs(Math.tan(point2.y / point1.x)) > 1)
            isUpToX = false;
    }

    var segmentLen = 10;
    var gap = 10;
    var segmentNum = Math.ceil(lineLen / (segmentLen + gap));
    var gapPercent = gap / (gap + segmentLen);   //空格占比
    //与y轴垂直
    if(isUpToX && isVerticalLine)
    {
        var stride = (point2.x - point1.x) / segmentNum;
        var y = point1.y;
        for(var i = 0; i < segmentNum; i++)
        {
            var fromPos = cc.p(point1.x + stride * i, y);
            var toPos = cc.p(point1.x + stride * (i + 1) - stride * gapPercent, y);
            this.drawSegment(fromPos, toPos, lineWidth, color);
        }
        return;
    }

    //与x轴垂直
    if(!isUpToX && isVerticalLine)
    {
        var stride = (point2.y - point1.y) / segmentNum;
        var x = point1.x;
        for(var i = 0; i < segmentNum; i++)
        {
            var fromPos = cc.p(x, point1.y + stride * i);
            var toPos = cc.p(x, point1.y + stride * (i + 1 - gapPercent));
            this.drawSegment(fromPos, toPos, lineWidth, color);
        }
        return;
    }

    //斜线
    if(!isVerticalLine)
    {
        var stride = (point2.x - point1.x) / segmentNum;
        for(var i = 0; i < segmentNum; i++)
        {
            var fromX = point1.x + stride * i;
            var toX = point1.x + stride * (i + 1 - gapPercent);
            var fromPos = cc.p(fromX, cc.anyYInLine(point1, point2, fromX));
            var toPos = cc.p(toX, cc.anyYInLine(point1, point2, toX));
            this.drawSegment(fromPos, toPos, lineWidth, color);
        }
        return;
    }
};

/**--------------------------ccui.Button扩展------------------------------*/
ccui.Widget.prototype.setGray = function(bool)
{
    if(bool == true)
    {
        UICommon.setGrayRecursive(this);
        this.setTouchEnabled(false);
    }
    else
    {
        UICommon.resumeColorRecursive(this);
        this.setTouchEnabled(true);
    }
};

if(!ccui.Widget.prototype._replaceAddClickEventListener)
{
    //掉包触摸事件
    ccui.Widget.prototype._replaceAddClickEventListener = ccui.Button.prototype.addClickEventListener;
    ccui.Widget.prototype.addClickEventListener = function(callback)
    {
        var self = this;
        var replaceCallback = function(){
            MainController.playEffect("click.mp3");
            
            ////判断是否要触发邀请码
            //if( appStoreName != APPSTORE_UNKWON
            //   && ClientConfig.getInstance().isNeedInvitationCode()
            //   && !GB.hasInvitationCode
            //   && Player.getInstance().isGuest()
            //   && !InvitationCodeLayer.getInstance().isVisible())
            //{
            //    var topLayer = MainController.getTopLayer();
            //    if(topLayer instanceof TradingHallLayer)
            //    {
            //        cc.log("topLayer layerName::", topLayer._layerName);
            //        InvitationCodeLayer.getInstance().show();
            //        return;
            //    }
            //}
            
            callback(self);
        };
        this._replaceAddClickEventListener(replaceCallback);
    };
   
}

ccui.Widget.prototype.setClickEffectEnabled = function(isEnable)
{
    //暂时废弃
    return;

    //if(isEnable == false){
    //    if(this._btnClickEffect){
    //        this._btnClickEffect.setEnable(false);
    //        this._btnClickEffect.setVisible(false);
    //    }
    //    return;
    //}
    //
    //if(!this._btnClickEffect){
    //    var btnClickEffect = new BtnClickEffect(this);
    //    this.addChild(btnClickEffect);
    //    btnClickEffect.setPosition(0, 0);
    //    this._btnClickEffect = btnClickEffect;
    //}
    //else{
    //    this._btnClickEffect.setEnable(true);
    //}
};

/**-------------cc.Sprite-------**/
cc.Sprite.prototype.lineTo = function(fromPos, toPos)
{
    var length = cc.pDistance(fromPos, toPos) + 0.3;
    this.setScaleX(length/this.width);
    //var angle = cc.pAngle(fromPos, toPos);
    var degree = 360 - Math.atan2(toPos.y-fromPos.y,toPos.x-fromPos.x) * 180/Math.PI;
    this.setPosition(fromPos);
    this.setRotation(degree);
};
