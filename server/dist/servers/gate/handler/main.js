"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserLeave = void 0;
var mydog_1 = require("mydog");
var Handler = /** @class */ (function () {
    function Handler(app) {
        this.app = app;
        this.roomMgr = app.get("roomMgr");
    }
    Handler.prototype.enter = function (msg, session, next) {
        if (session.uid) {
            return;
        }
        var uid = this.roomMgr.enter(msg.nickname);
        session.bind(uid);
        next({ "uid": uid, "nickname": msg.nickname });
    };
    Handler.prototype.matchOrNot = function (msg, session, next) {
        if (session.get("roomId")) {
            return;
        }
        var res = this.roomMgr.match(session.uid);
        next(res);
    };
    Handler.prototype.frameMsg = function (msg, session, next) {
        var room = this.roomMgr.getRoom(session.get("roomId"));
        if (!room) {
            return;
        }
        var p = room.getPlayer(session.uid);
        p.frameMsg(msg);
    };
    Handler.prototype.gameOver = function (msg, session, next) {
        var room = this.roomMgr.getRoom(session.get("roomId"));
        if (!room) {
            return;
        }
        room.gameOver();
    };
    Handler.prototype.getMovieList = function (msg, session, next) {
        next(this.roomMgr.getMovieList());
    };
    Handler.prototype.getMovieData = function (msg, session, next) {
        next({ "id": msg.id, "data": this.roomMgr.getMovieData(msg.id) });
    };
    return Handler;
}());
exports.default = Handler;
function onUserLeave(session) {
    var uid = session.uid;
    if (!uid) {
        return;
    }
    console.log("leave", uid);
    var roomMgr = mydog_1.app.get("roomMgr");
    roomMgr.onUserLeave(session);
}
exports.onUserLeave = onUserLeave;
