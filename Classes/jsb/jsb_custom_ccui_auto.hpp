#include "base/ccConfig.h"
#ifndef __cocos2dx_ui_custom_h__
#define __cocos2dx_ui_custom_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_cocos2d_ui_RichElementEx_class;
extern JSObject *jsb_cocos2d_ui_RichElementEx_prototype;

bool js_cocos2dx_ui_custom_RichElementEx_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_ui_custom_RichElementEx_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_ui_custom_RichElementEx(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_ui_custom(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_ui_custom_RichElementEx_getColor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_getType(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_setClickCallback(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_init(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_getClickCallback(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_getOpacity(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_getTag(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementEx_RichElementEx(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_cocos2d_ui_RichElementTextEx_class;
extern JSObject *jsb_cocos2d_ui_RichElementTextEx_prototype;

bool js_cocos2dx_ui_custom_RichElementTextEx_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_ui_custom_RichElementTextEx_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_ui_custom_RichElementTextEx(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_ui_custom(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_ui_custom_RichElementTextEx_disableOutline(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_getFontSize(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_enableOutline(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_disableUnderline(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_getText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_init(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_enableUnderline(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_getFontName(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementTextEx_RichElementTextEx(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_cocos2d_ui_RichElementImageEx_class;
extern JSObject *jsb_cocos2d_ui_RichElementImageEx_prototype;

bool js_cocos2dx_ui_custom_RichElementImageEx_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_ui_custom_RichElementImageEx_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_ui_custom_RichElementImageEx(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_ui_custom(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_ui_custom_RichElementImageEx_setScaleY(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_setScaleX(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_setScale(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_init(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_getFilePath(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_getTextureType(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementImageEx_RichElementImageEx(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_cocos2d_ui_RichElementCustomNodeEx_class;
extern JSObject *jsb_cocos2d_ui_RichElementCustomNodeEx_prototype;

bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_ui_custom_RichElementCustomNodeEx_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_ui_custom_RichElementCustomNodeEx(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_ui_custom(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_init(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_RichElementCustomNodeEx(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_cocos2d_ui_RichTextEx_class;
extern JSObject *jsb_cocos2d_ui_RichTextEx_prototype;

bool js_cocos2dx_ui_custom_RichTextEx_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_ui_custom_RichTextEx_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_ui_custom_RichTextEx(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_ui_custom(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_ui_custom_RichTextEx_insertElement(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_getVerticalSpace(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_getEmptyLineHeight(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_pushBackElement(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_getHorizontalAlignment(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_ignoreContentAdaptWithSize(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_setAnchorPoint(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_setVerticalSpace(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_setHorizontalAlignment(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_formatText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_removeElement(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_setEmptyLineHeight(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_ui_custom_RichTextEx_RichTextEx(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __cocos2dx_ui_custom_h__
