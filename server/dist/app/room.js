"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
var util_1 = require("./util");
var Room = /** @class */ (function () {
    function Room(roomId, app) {
        this.timer = null;
        this.players = [];
        this.uids = [];
        this.frameId = 1;
        this.randomSeed = 0;
        this.startData = null;
        this.frames = [];
        this.roomId = roomId;
        this.app = app;
        this.timer = setInterval(this.update.bind(this), 1000 / 5);
        this.randomSeed = Math.floor(Math.random() * 100000);
    }
    Room.prototype.init = function (players) {
        this.players = players;
        var arr = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var one = _a[_i];
            this.app.applySession(one.uid, { "roomId": this.roomId });
            one.isMatching = false;
            this.uids.push(one.uid);
            arr.push({ "uid": one.uid, "nickname": one.nickname });
        }
        this.startData = { "randomSeed": this.randomSeed, "players": arr };
        this.sendMsgToAll(4 /* onStartGame */, this.startData);
    };
    Room.prototype.getPlayer = function (uid) {
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var one = _a[_i];
            if (one.uid === uid) {
                return one;
            }
        }
        return null;
    };
    Room.prototype.userLeave = function (uid) {
        var p = this.getPlayer(uid);
        util_1.removeFromArr(this.uids, uid);
        if (this.uids.length === 0) {
            clearInterval(this.timer);
            this.app.get("roomMgr").delRoom(this.roomId);
        }
    };
    Room.prototype.update = function () {
        this.sendFrame();
    };
    Room.prototype.sendFrame = function () {
        var msg = { "frameId": this.frameId };
        this.frameId++;
        var frameMsg = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var one = _a[_i];
            var pArr = one.getFrameMsg();
            if (pArr.length > 0) {
                frameMsg.push({ "uid": one.uid, "msg": pArr });
            }
        }
        if (frameMsg.length > 0) {
            msg.frameMsg = frameMsg;
        }
        this.frames.push(msg);
        this.sendMsgToAll(3 /* onFrame */, msg);
    };
    Room.prototype.sendMsgToAll = function (route, msg) {
        this.app.sendMsgByUid(route, msg, this.uids);
    };
    Room.prototype.gameOver = function () {
        clearInterval(this.timer);
        var nameArr = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var one = _a[_i];
            this.app.applySession(one.uid, { "roomId": 0 });
            nameArr.push(one.nickname);
        }
        var roomMgr = this.app.get("roomMgr");
        roomMgr.delRoom(this.roomId);
        roomMgr.newMovie({ "startData": this.startData, "frames": this.frames }, nameArr);
    };
    return Room;
}());
exports.Room = Room;
