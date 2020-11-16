"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomMgr = void 0;
var player_1 = require("./player");
var util_1 = require("./util");
var room_1 = require("./room");
var RoomMgr = /** @class */ (function () {
    function RoomMgr(app) {
        this.uid = 1; //玩家uid
        this.roles = {}; // 玩家集合
        this.roomId = 1; // 房间id
        this.rooms = {}; // 房间集合
        this.matchList = []; // 匹配列表
        this.movieId = 1; // 录像id
        this.movies = [];
        this.app = app;
        setInterval(this.matchInterval.bind(this), 1000);
    }
    RoomMgr.prototype.getRole = function (uid) {
        return this.roles[uid];
    };
    RoomMgr.prototype.getRoom = function (roomId) {
        return this.rooms[roomId];
    };
    RoomMgr.prototype.getPlayer = function (roomId, uid) {
        return this.getRoom(roomId).getPlayer(uid);
    };
    RoomMgr.prototype.enter = function (nickname) {
        var uid = this.uid++;
        var p = new player_1.Player(uid, nickname);
        this.roles[uid] = p;
        return uid;
    };
    RoomMgr.prototype.match = function (uid) {
        var role = this.getRole(uid);
        if (role.isMatching) {
            role.isMatching = false;
            util_1.removeFromArr(this.matchList, role);
            return { "isMatching": false };
        }
        role.isMatching = true;
        this.matchList.unshift(role);
        return { "isMatching": true };
    };
    RoomMgr.prototype.onUserLeave = function (session) {
        var role = this.getRole(session.uid);
        var roomId = session.get("roomId");
        if (role.isMatching) {
            util_1.removeFromArr(this.matchList, role);
        }
        else if (roomId) {
            var room = this.getRoom(roomId);
            room.userLeave(session.uid);
        }
        delete this.roles[session.uid];
    };
    RoomMgr.prototype.matchInterval = function () {
        for (var i = this.matchList.length - 2; i >= 0; i -= 2) {
            var p1 = this.matchList.pop();
            var p2 = this.matchList.pop();
            var roomId = this.roomId++;
            var room = new room_1.Room(roomId, this.app);
            this.rooms[roomId] = room;
            room.init([p1, p2]);
        }
    };
    RoomMgr.prototype.delRoom = function (roomId) {
        delete this.rooms[roomId];
        console.log("房间销毁", roomId);
    };
    RoomMgr.prototype.newMovie = function (data, nameArr) {
        this.movies.push({ "id": this.movieId++, "time": new Date().toLocaleString(), "nameArr": nameArr, "data": data });
        if (this.movies.length > 15) {
            this.movies.splice(10);
        }
    };
    RoomMgr.prototype.getMovieList = function () {
        var arr = [];
        for (var _i = 0, _a = this.movies; _i < _a.length; _i++) {
            var one = _a[_i];
            arr.push({ "id": one.id, "time": one.time, "nameArr": one.nameArr });
        }
        return { "list": arr };
    };
    RoomMgr.prototype.getMovieData = function (id) {
        for (var _i = 0, _a = this.movies; _i < _a.length; _i++) {
            var one = _a[_i];
            if (one.id === id) {
                return one.data;
            }
        }
        return null;
    };
    return RoomMgr;
}());
exports.RoomMgr = RoomMgr;
