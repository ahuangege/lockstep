// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "./network";
import { cmd } from "./cmdClient";
import { getChildByName } from "./util";
import { PlayerInfo } from "./playerInfo";
import { MoviePrefab } from "./moviePrefab";

const { ccclass, property } = cc._decorator;


@ccclass
export class Main extends cc.Component {
    public static instance: Main = null;
    @property(cc.String)
    private ip: string = "127.0.0.1"
    @property(cc.Prefab)
    private moviePrefab: cc.Prefab = null;
    private movieParent: cc.Node = null;
    public isMatching = false;
    onLoad() {
        Main.instance = this;
        this.movieParent = getChildByName(this.node, "match/scroll").children[0].children[0];
    }

    start() {
        network.onOpen(this._svr_onOpen, this);
        network.onClose(this._svr_onClose, this);
        if (!network.isConnected()) {
            network.connect(this.ip, 4001);
            getChildByName(this.node, "connectSvr").active = true;
        } else {
            this._registerMsgHandler();
            getChildByName(this.node, "match").active = true;
            getChildByName(this.node, "match/name").getComponent(cc.Label).string = PlayerInfo.nickname;
            network.sendMsg(cmd.gate_main_getMovieList);
        }
    }


    // 服务器连接成功
    private _svr_onOpen() {
        console.log("server open")
        getChildByName(this.node, "connectSvr").active = false;
        getChildByName(this.node, "login").active = true;
        this._registerMsgHandler();
    }

    private _registerMsgHandler() {
        network.addHandler(cmd.gate_main_enter, this._svr_enterGameBack, this);
        network.addHandler(cmd.gate_main_matchOrNot, this._svr_matchBack, this);
        network.addHandler(cmd.onStartGame, this._svr_onStartGame, this);
        network.addHandler(cmd.gate_main_getMovieList, this._svr_getMovieListBack, this);
        network.addHandler(cmd.gate_main_getMovieData, this._svr_getMovieDataBack, this);
    }

    // 服务器断开连接
    private _svr_onClose() {
        console.log("server close")
        getChildByName(this.node, "svrClose").active = true;
    }

    private btn_reloadScene() {
        cc.director.loadScene("test");
    }

    private btn_enterGame() {
        let nickname = getChildByName(this.node, "login/nameEdit").getComponent(cc.EditBox).string.trim();
        network.sendMsg(cmd.gate_main_enter, { "nickname": nickname });
    }
    private _svr_enterGameBack(msg) {
        PlayerInfo.uid = msg.uid;
        PlayerInfo.nickname = msg.nickname;
        getChildByName(this.node, "login").active = false;
        getChildByName(this.node, "match").active = true;
        getChildByName(this.node, "match/name").getComponent(cc.Label).string = msg.nickname;
        network.sendMsg(cmd.gate_main_getMovieList);
    }

    private btn_matchOrNot() {
        network.sendMsg(cmd.gate_main_matchOrNot);
    }
    private _svr_matchBack(msg) {
        let btnMatch = getChildByName(this.node, "match/btn_match");
        this.isMatching = msg.isMatching;
        if (msg.isMatching) {
            btnMatch.children[0].children[0].getComponent(cc.Label).string = "取消匹配";
            btnMatch.children[1].active = true;
        } else {
            btnMatch.children[0].children[0].getComponent(cc.Label).string = "匹配";
            btnMatch.children[1].active = false;
        }
    }

    private _svr_onStartGame(msg: { randomSeed: number, players: { uid: number, nickname: string }[] }) {
        PlayerInfo.startGameData = msg;
        PlayerInfo.isMovie = false;
        cc.director.loadScene("game");
    }

    update() {
        network.readMsg();
    }

    private _svr_getMovieListBack(msg: { "list": any[] }) {
        for (let one of msg.list) {
            let node = cc.instantiate(this.moviePrefab);
            node.parent = this.movieParent;
            node.getComponent(MoviePrefab).init(one);
        }
    }
    private _svr_getMovieDataBack(msg: { "id": number, "data": any }) {
        if (!msg.data) {
            this.movieParent.getChildByName(msg.id.toString()).destroy();
            return;
        }
        PlayerInfo.isMovie = true;
        PlayerInfo.startGameData = msg.data.startData;
        PlayerInfo.frames = msg.data.frames;
        cc.director.loadScene("game");
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}

