"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mydog_1 = require("mydog");
var app = mydog_1.createApp();
var roomMgr_1 = require("./app/roomMgr");
var main_1 = require("./servers/gate/handler/main");
app.setConfig("connector", { "connector": mydog_1.connector.connectorWs, clientOffCb: main_1.onUserLeave });
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode });
app.configure("gate", function () {
    app.set("roomMgr", new roomMgr_1.RoomMgr(app));
});
app.start();
process.on("uncaughtException", function (err) {
    console.log(err);
});
function msgDecode(cmdId, msgBuf) {
    var msg = msgBuf.toString();
    console.log("--->>>", app.routeConfig[cmdId], msg);
    return JSON.parse(msg);
}
function msgEncode(cmdId, msg) {
    var msgStr = JSON.stringify(msg);
    console.log("<<<---", app.routeConfig[cmdId], msgStr);
    return Buffer.from(msgStr);
}
