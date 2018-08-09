#include "base/ccConfig.h"
#ifndef __custom_h__
#define __custom_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_NativeTool_class;
extern JSObject *jsb_NativeTool_prototype;

bool js_custom_NativeTool_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_custom_NativeTool_finalize(JSContext *cx, JSObject *obj);
void js_register_custom_NativeTool(JSContext *cx, JS::HandleObject global);
void register_all_custom(JSContext* cx, JS::HandleObject obj);
bool js_custom_NativeTool_generateAESKey(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_AESEncryt(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_openPhoto(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_getCurMillSecs(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_downloadImage(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_AESDecryt(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_openCamera(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_getClockTick(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_stringByMD5(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NativeTool_NativeTool(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_GameFileUtils_class;
extern JSObject *jsb_GameFileUtils_prototype;

bool js_custom_GameFileUtils_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_custom_GameFileUtils_finalize(JSContext *cx, JSObject *obj);
void js_register_custom_GameFileUtils(JSContext *cx, JS::HandleObject global);
void register_all_custom(JSContext* cx, JS::HandleObject obj);
bool js_custom_GameFileUtils_getFileListInPath(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_getFileList(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_writeStringToFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_createPath(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_writeFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_removeAllFiles(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_getFileNameListInPath(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_deleteFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_getWritablePath(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_GameFileUtils_GameFileUtils(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_NetworkManager_class;
extern JSObject *jsb_NetworkManager_prototype;

bool js_custom_NetworkManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_custom_NetworkManager_finalize(JSContext *cx, JSObject *obj);
void js_register_custom_NetworkManager(JSContext *cx, JS::HandleObject global);
void register_all_custom(JSContext* cx, JS::HandleObject obj);
bool js_custom_NetworkManager_tryConnectToServer(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_check_heartbeat(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_disconnect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_setAESKEY(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_getRequestData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_connectToServer(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_dispatchAndReleaseAllEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_onReceiveData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_dispatchEventSafe(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_changeEncrytKey(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_check_keepalived(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_addRequest(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_NetworkManager_NetworkManager(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_EventGame_class;
extern JSObject *jsb_EventGame_prototype;

bool js_custom_EventGame_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_custom_EventGame_finalize(JSContext *cx, JSObject *obj);
void js_register_custom_EventGame(JSContext *cx, JS::HandleObject global);
void register_all_custom(JSContext* cx, JS::HandleObject obj);
bool js_custom_EventGame_getStrData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_EventGame_setStrData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_custom_EventGame_EventGame(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __custom_h__
