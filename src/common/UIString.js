///**
// * Created by 玲英 on 2016/10/4.
// */
//
//
var UIString = UIString || {};
//
/**
* @param {string} str
* @param {string} fontName
* @param {number|float} fontSize
* @param {cc.Color} [color3b]
* @param {Function} [selector]
* @returns {Array}
*/
UIString.scriptToRichElementExArray = function(str, fontName, fontSize, color3b, selector) {
    var arr = [];
    if (str.indexOf("<b") == -1 && str.indexOf("<l") == -1 && str.indexOf("<i") == -1) {
        var text = new ccui.RichElementTextEx(0, color3b == undefined ? cc.BLACK : color3b, 255, str, fontName, fontSize);
        arr.push(text);
        return arr;
    }

    var p = 0, rem = 0, len = str.length;
    while (p < len) {
        var labelType = str.charAt(p + 1);

        // 匹配未开始
        if (str.charAt(p) != '<' || (labelType != 'b' && labelType != 'l' && labelType != 'i')) {
            ++p;
            continue;
        }

        var blockEndTag1;
        switch (labelType) {
            case 'b':
            case 'l':
                // 找属性结束标签
                blockEndTag1 = str.indexOf('>', p + 2);
                if (blockEndTag1 == -1) {
                    ++p;
                } else {
                    // 构造字符串结束标签
                    var endTag = (labelType == 'l') ? "</l>" : "</b>";

                    // 找字符串结束标签
                    var blockEndTag2 = str.indexOf(endTag, blockEndTag1 + 1);
                    if (blockEndTag2 == -1) {
                        ++p;
                    } else {
                        if (rem < p) {
                            var subStr = str.substr(rem, p - rem);  // 先前剩余的字符串
                            var text = new ccui.RichElementTextEx(0, color3b == undefined ? cc.BLACK : color3b, 255, subStr, fontName, fontSize);
                            arr.push(text);
                        }

                        if (blockEndTag1 + 1 < blockEndTag2) {
                            var attributeDic = ALCommon.parseStringAttribute(str.substr(p, blockEndTag1 + 1 - p));
                            var tempColor = color3b;
                            var colorStr = attributeDic["c"];
                            if (colorStr != undefined) {
                                tempColor = UICommon.colorFromHexString(colorStr);
                            }
                            var tempFontSize = fontSize;
                            var fontSizeStr = attributeDic["s"];
                            if (fontSizeStr != undefined) {
                                tempFontSize = parseFloat(fontSizeStr);
                            }
                            var tempFontName = fontName;
                            var fontNameStr = attributeDic["f"];
                            if (fontNameStr != undefined) {
                                tempFontName = fontNameStr;
                                //if(fontNameStr == "FONT_FZDHTJW")       tempFontName = FONT_FZDHTJW;    //确保字体能识别宏
                                //if(fontNameStr == "FONT_HYK1GJ")        tempFontName = FONT_HYK1GJ;
                                //if(fontNameStr == "FONT_ARIAL_BOLD")    tempFontName = FONT_ARIAL_BOLD;
                            }

                            var subStr = str.substr(blockEndTag1 + 1, blockEndTag2 - (blockEndTag1 + 1));
//                            cc.log("解析："+subStr);
//                            cc.log("tempColor："+tempColor);
//                            cc.log("tempFontName："+tempFontName);
//                            cc.log("tempFontSize："+tempFontSize);
//                            cc.log("fontSizeStr："+fontSizeStr);
//                            cc.log("colorStr："+colorStr);
                            var text = ccui.RichElementTextEx.create(0, tempColor == undefined ? cc.BLACK : tempColor, 255, subStr, tempFontName, tempFontSize);
                            if (labelType == 'b' && selector != undefined) {
                                text.setClickCallback(selector);
                            }
                            var underline = attributeDic["u"];
                            if (underline == 1) {
                                text.enableUnderline();
                            }
                            var outlineColorStr = attributeDic["b"];
                            if (outlineColorStr != undefined) {
                                text.enableOutline(UICommon.colorFromHexString(outlineColorStr), 4);
                            }
                            arr.push(text);
                        }
                        p = blockEndTag2 + 4;
                        rem = p;
                    }
                }
                break;

            case 'i':
                // 找属性结束标签
                blockEndTag1 = str.indexOf("/>", p + 2);
                if (blockEndTag1 == -1) {
                    ++p;
                } else {
                    if (rem < p) {
                        var subStr = str.substr(rem, p - rem);  // 先前剩余的字符串
                        var text = ccui.RichElementTextEx.create(0, color3b == undefined ? cc.BLACK : color3b, 255, subStr, fontName, fontSize);
                        arr.push(text);
                    }

                    // 解出属性
                    var attributeDic = ALCommon.parseStringAttribute(str.substr(p, blockEndTag1 + 1 - p));
                    var imageName = attributeDic["n"];
                    if (imageName != undefined) {
                        var scale = 1;
                        var scaleStr = attributeDic["s"];
                        if (scaleStr != undefined) {
                            scale = parseFloat(scaleStr);
                        }
                        var rotateStr = attributeDic["r"];
                        if (rotateStr != undefined) {
                            // TODO: 旋转
                        }

                        var image = null;
                        if (1) {
                            // 先只用PLIST_TEXTURE
                            image = ccui.RichElementImageEx.create(0, cc.WHITE, 255, imageName + ".png", ccui.RichElementImageEx.PLIST_TEXTURE);
                            if (scale != 1) {
                                image.setScale(scale);
                            }
                        } else {
                            image = ccui.RichElementImageEx.create(0, cc.WHITE, 255, "res/" + imageName + ".png", ccui.RichElementImageEx.LOCAL_TEXTURE);
                        }
                        arr.push(image);
                    }
                    p = blockEndTag1 + 2;
                    rem = p;
                }
                break;

            default:
                break;
        }
    }

    if (rem < p) { // 剩余的字符串
        var subStr = str.substr(rem, p - rem);
        var text = ccui.RichElementTextEx.create(0, color3b == undefined ? cc.BLACK : color3b, 255, subStr, fontName, fontSize);
        arr.push(text);
    }

    return arr;
};

/**
* 这里的uiString用于当不需要换行时用
* @param str
* @param [fontName]
* @param [fontSize]
* @param [color3b]
* @param [selector]
* @returns {Array}
*/
UIString.scriptToWidgetArray = function(str, fontName, fontSize, color3b, selector) {
    var fontName = fontName || FONT_ARIAL_BOLD;
    var fontSize = fontSize || 24;
    var color3b =  color3b || cc.WHITE;

    var arr = [];
    if (str.indexOf("<b") == -1 && str.indexOf("<l") == -1 && str.indexOf("<i") == -1) {
        var text = new cc.LabelTTF(str, fontName, fontSize);
        text.setColor(color3b == undefined ? cc.BLACK : color3b);
        arr.push(text);
        return arr;
    }

    var p = 0, rem = 0, len = str.length;
    while (p < len) {
        var labelType = str.charAt(p + 1);

        // 匹配未开始
        if (str.charAt(p) != '<' || (labelType != 'b' && labelType != 'l' && labelType != 'i')) {
            ++p;
            continue;
        }

        var blockEndTag1;
        switch (labelType) {
            case 'b':
            case 'l':
                // 找属性结束标签
                blockEndTag1 = str.indexOf('>', p + 2);
                if (blockEndTag1 == -1) {
                    ++p;
                } else {
                    // 构造字符串结束标签
                    var endTag = (labelType == 'l') ? "</l>" : "</b>";

                    // 找字符串结束标签
                    var blockEndTag2 = str.indexOf(endTag, blockEndTag1 + 1);
                    if (blockEndTag2 == -1) {
                        ++p;
                    } else {
                        if (rem < p) {
                            var subStr = str.substr(rem, p - rem);  // 先前剩余的字符串
                            var text = new cc.LabelTTF(subStr, fontName, fontSize);
                            text.setColor(color3b == undefined ? cc.BLACK : color3b);
                            arr.push(text);
                        }

                        if (blockEndTag1 + 1 < blockEndTag2) {
                            var attributeDic = ALCommon.parseStringAttribute(str.substr(p, blockEndTag1 + 1 - p));
                            var tempColor = color3b;
                            var colorStr = attributeDic["c"];
                            if (colorStr != undefined) {
                                tempColor = UICommon.colorFromHexString(colorStr);
                            }
                            var tempFontSize = fontSize;
                            var fontSizeStr = attributeDic["s"];
                            if (fontSizeStr != undefined) {
                                tempFontSize = parseFloat(fontSizeStr);
                            }
                            var tempFontName = fontName;
                            var fontNameStr = attributeDic["f"];
                            if (fontNameStr != undefined) {
                                tempFontName = fontNameStr;
                                if(fontNameStr == "FONT_FZDHTJW")       tempFontName = FONT_FZDHTJW;    //确保字体能识别宏
                                if(fontNameStr == "FONT_HYK1GJ")        tempFontName = FONT_HYK1GJ;
                                if(fontNameStr == "FONT_ARIAL_BOLD")    tempFontName = FONT_ARIAL_BOLD;
                            }

                            var subStr = str.substr(blockEndTag1 + 1, blockEndTag2 - (blockEndTag1 + 1));
//                            cc.log("解析："+subStr);
//                            cc.log("tempColor："+tempColor);
//                            cc.log("tempFontName："+tempFontName);
//                            cc.log("tempFontSize："+tempFontSize);
//                            cc.log("fontSizeStr："+fontSizeStr);
//                            cc.log("colorStr："+colorStr);
                            var text = new cc.LabelTTF(subStr, tempFontName, tempFontSize);//ccui.RichElementTextEx.create(0, tempColor == undefined ? cc.BLACK : tempColor, 255, subStr, tempFontName, tempFontSize);
                            text.setColor(tempColor == undefined ? cc.BLACK : tempColor);
                            if (labelType == 'b' && selector != undefined) {
                                text.addTouchEventListenerOneByOne(selector);
                            }
//                            var underline = attributeDic["u"];
//                            if (underline == 1) {
//                                text.enableUnderline();
//                            }
                            var outlineColorStr = attributeDic["b"];
                            if (outlineColorStr != undefined) {
                                text.enableStroke(UICommon.colorFromHexString(outlineColorStr), 4);
                            }
                            arr.push(text);
                        }
                        p = blockEndTag2 + 4;
                        rem = p;
                    }
                }
                break;

            case 'i':
                // 找属性结束标签
                blockEndTag1 = str.indexOf("/>", p + 2);
                if (blockEndTag1 == -1) {
                    ++p;
                } else {
                    if (rem < p) {
                        var subStr = str.substr(rem, p - rem);  // 先前剩余的字符串
                        var text = new cc.LabelTTF(subStr, fontName, fontSize);//ccui.RichElementTextEx.create(0, color3b == undefined ? cc.BLACK : color3b, 255, subStr, fontName, fontSize);
                        text.setColor(color3b == undefined ? cc.BLACK : color3b);
                        //
                        arr.push(text);
                    }

                    // 解出属性
                    var attributeDic = ALCommon.parseStringAttribute(str.substr(p, blockEndTag1 + 1 - p));
                    var imageName = attributeDic["n"];
                    if (imageName != undefined) {
                        var scale = 1;
                        var scaleStr = attributeDic["s"];
                        if (scaleStr != undefined) {
                            scale = parseFloat(scaleStr);
                        }
                        var rotateStr = attributeDic["r"];
                        if (rotateStr != undefined) {
                            // TODO: 旋转
                        }

                        var image = null;
                        if (cc.spriteFrameCache.getSpriteFrame(imageName + ".png")) {
                            // 先只用PLIST_TEXTURE
                            image = new cc.Sprite("#"+imageName + ".png");//ccui.RichElementImageEx.create(0, cc.WHITE, 255, imageName + ".png", ccui.RichElementImageEx.PLIST_TEXTURE);
                            if (scale != 1) {
                                image.setScale(scale);
                            }
                        } else {
                            //image = ccui.RichElementImageEx.create(0, cc.WHITE, 255, "res/" + imageName + ".png", ccui.RichElementImageEx.LOCAL_TEXTURE);
                        }
                        arr.push(image);
                    }
                    p = blockEndTag1 + 2;
                    rem = p;
                }
                break;

            default:
                break;
        }
    }

    if (rem < p) { // 剩余的字符串
        var subStr = str.substr(rem, p - rem);
        var text = new cc.LabelTTF(subStr, fontName, fontSize);//ccui.RichElementTextEx.create(0, color3b == undefined ? cc.BLACK : color3b, 255, subStr, fontName, fontSize);
        text.setColor(color3b == undefined ? cc.BLACK : color3b);
        arr.push(text);
    }

    return arr;
};
//
/**
* @param {string} str
* @param [number|float] width
* @param {string} fontName
* @param {number|float} fontSize
* @param {cc.Color} [color3b]
* @param {function} [callback]
* @param {int} [verticalSpace]
* @returns {ccui.RichTextEx}
*/
UIString.scriptToRichTextEx = function(str, width, fontName, fontSize, color3b, callback, verticalSpace) {
    //没有宽度限制的时候
    if(width == undefined || width == 0 ){
        var arr = UIString.scriptToWidgetArray(str, fontName, fontSize, color3b, callback);
        var panel = UICommon.createPanelAlignWidgetsWithPadding(2, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, arr);
        return panel;

    }else
     {
        var richText = new ccui.RichTextEx();
        richText.setContentSize(cc.size(width <= 0 ? cc.winSize.width : width, 0));
        var arr = UIString.scriptToRichElementExArray(str, fontName, fontSize, color3b, callback);
        for (var i = 0, l = arr.length; i < l; ++i) {
            richText.pushBackElement(arr[i]);
        }

        if(verticalSpace)
        {
            richText.setVerticalSpace(verticalSpace);
        }

        richText.formatText();
        richText.setTouchEnabled(true);

        cc.log("richText:"+JSON.stringify(richText.getVirtualRendererSize()));

        return richText;
    }
};
