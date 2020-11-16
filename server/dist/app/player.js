"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var Player = /** @class */ (function () {
    function Player(uid, nickname) {
        this.isMatching = false;
        this.msgArr = [];
        this.uid = uid;
        this.nickname = nickname;
    }
    Player.prototype.frameMsg = function (msg) {
        this.msgArr.push(msg);
    };
    Player.prototype.getFrameMsg = function () {
        var arr = this.msgArr;
        this.msgArr = [];
        return arr;
    };
    return Player;
}());
exports.Player = Player;
