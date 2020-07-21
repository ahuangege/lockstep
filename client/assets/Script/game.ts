import { Player } from "./player";
import { Monster } from "./monster";
import { Bullet } from "./bullet";
import * as util from "./util";
import { network } from "./network";
import { cmd } from "./cmdClient";
import { PlayerInfo } from "./playerInfo";
import { Decimal } from "./Decimal";

const { ccclass, property } = cc._decorator;


enum e_movieFunc {
    x1, // 正常播放
    x2, // 2倍速播放
    x4, // 4倍速播放
    paused,     // 暂停
}

const svrFPS = 5 * 2;   // 客户端数据逻辑帧数
const frameDt = 1000 / svrFPS;  // 每两个逻辑帧之间的时间差（毫秒，此demo中必须为整数）

@ccclass
export class Game extends cc.Component {

    public static instance: Game = null;

    private lastFrameId: number = 0;
    private frameArr: I_frameData[] = [];
    private readTime: number = 0;
    private players: Player[] = [];
    private monsters: Monster[] = [];
    private bullets: Bullet[] = [];

    @property(cc.Prefab)
    private monsterPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private bulletPrefab: cc.Prefab = null;
    private nodeParent: cc.Node = null;
    private monsterTime = 0;
    private readFPS = 0;
    private readPerTime = 1;
    private gameOverTime = 20 * 1000;   // 游戏局时
    private timeLabel: cc.Label = null;
    private gameOver = false;   // 游戏是否结束
    private movieFunc: e_movieFunc = e_movieFunc.x1;

    onLoad() {
        Game.instance = this;
        this.nodeParent = this.node;
        this.timeLabel = util.getChildByName(this.node, "time").getComponent(cc.Label);
    }

    start() {
        this._setTimeLabel();
        this._changeReadFrame(svrFPS);
        network.addHandler(cmd.onFrame, this._svr_onFrame, this);
        network.onClose(this._svr_onClose, this);
        this._init();
    }

    private _init() {
        let isMovie = PlayerInfo.isMovie;
        this.node.getChildByName("btn_rand").active = !isMovie;
        this.node.getChildByName("btn_out").active = isMovie;
        this.node.getChildByName("btn_func").active = isMovie;

        let startData = PlayerInfo.startGameData;
        util.f_Math.setRandSeed(startData.randomSeed);
        let usedId: number = 0;
        let hasMe = false;
        for (let one of startData.players) {
            if (one.uid === PlayerInfo.uid) {
                hasMe = true;
                break;
            }
        }
        for (let one of startData.players) {
            if (usedId === 0) {
                if (hasMe) {
                    if (one.uid === PlayerInfo.uid) {
                        usedId = 1;
                    } else {
                        usedId = 2;
                    }
                } else {
                    usedId = 1;
                }
            } else {
                usedId = 3 - usedId;
            }
            let p: Player = util.getChildByName(this.node, "p" + usedId).getComponent(Player);
            this.players.push(p);
            p.init(one.uid, one.nickname, usedId === 1);
        }
        if (isMovie) {
            for (let one of PlayerInfo.frames) {
                this.frameArr.push(one);
                this.frameArr.push({} as any);
            }
        }
        PlayerInfo.startGameData = null;
        PlayerInfo.frames = [];
    }

    // 服务器断开连接
    private _svr_onClose() {
        console.log("server close")
        cc.director.loadScene("test");
    }

    update(dt) {
        network.readMsg();
        this.readTime -= dt;
        if (this.readTime <= 0) {
            this.readTime = this.readPerTime + this.readTime;
            this._readFrame();
        }
    }

    private _changeReadFrame(count: number) {
        this.readFPS = count;
        this.readPerTime = 1 / this.readFPS;
        this.readTime = 0;
    }

    private _svr_onFrame(msg: I_frameData) { // 服务器每秒发5帧，客户端每帧后插入1个空帧，即客户端每秒10个数据帧
        this.frameArr.push(msg);
        this.frameArr.push({} as any);
    }

    private _readFrame() {
        if (this.gameOver) {
            return;
        }
        if (this.frameArr.length <= 0) {
            return;
        }
        this._frameDecode(this.frameArr.shift())
        this._logicUpdate(frameDt);
    }

    _getPlayer(uid: number) {
        let p: Player = null;
        for (let one of this.players) {
            if (one.uid === uid) {
                p = one;
                break;
            }
        }
        return p;
    }

    private _frameDecode(data: I_frameData) {
        if (!data.frameMsg) {
            return;
        }
        for (let one of data.frameMsg) {
            let p = this._getPlayer(one.uid);
            for (let msg of one.msg) {
                switch (msg.t) {
                    case frame_t.randomHurt:
                        p.randomHurt();
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private _logicUpdate(dt: number) {
        this.gameOverTime -= dt;
        if (this.gameOverTime < 0) {
            this.gameOver = true;
            network.sendMsg(cmd.gate_main_gameOver);
            this.node.getChildByName("btn_out").active = true;
            return;
        }

        for (let i = this.players.length - 1; i >= 0; i--) {
            this.players[i].updateF(dt);
        }

        this.monsterTime += dt;
        if (this.monsterTime >= 2000) {
            this.monsterTime = 0;
            this._newMonster();
        }

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            this.monsters[i].updateF(dt);
        }
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].updateF(dt);
        }

        this._setTimeLabel();
    }


    private _newMonster() {
        let node = cc.instantiate(this.monsterPrefab);
        node.parent = this.nodeParent;
        let com = node.getComponent(Monster);
        com.init();
        this.monsters.push(com);
    }

    _getRandomMonster() {
        return util.f_Math.randArrElement(this.monsters);
    }

    _delMonster(monster: Monster) {
        util.removeFromArr(this.monsters, monster);
    }


    _createBullet(x: number, y: number, target: Monster, hurt: number, uid: number) {
        let node = cc.instantiate(this.bulletPrefab);
        node.parent = this.nodeParent;
        let com = node.getComponent(Bullet);
        com.init(x, y, target, hurt, uid);
        this.bullets.push(com);
    }

    _delBullet(bullet: Bullet) {
        util.removeFromArr(this.bullets, bullet);
    }

    private btn_randomHurt() {
        network.sendMsg(cmd.gate_main_frameMsg, { "t": frame_t.randomHurt });
    }

    private btn_outRoom() {
        cc.director.loadScene("login");
    }

    private btn_movieFunc() {
        let label = util.getChildByName(this.node, "btn_func").children[0].children[0].getComponent(cc.Label);
        if (this.movieFunc === e_movieFunc.x1) {
            this.movieFunc = e_movieFunc.x2;
            this._changeReadFrame(svrFPS * 2);
            label.string = "x2";
        } else if (this.movieFunc === e_movieFunc.x2) {
            this.movieFunc = e_movieFunc.x4;
            this._changeReadFrame(svrFPS * 4);
            label.string = "x4";
        } else if (this.movieFunc === e_movieFunc.x4) {
            this.movieFunc = e_movieFunc.paused;
            this._changeReadFrame(0);
            label.string = "暂停";
        } else {
            this.movieFunc = e_movieFunc.x1;
            this._changeReadFrame(svrFPS);
            // console.log(this.)
            label.string = "x1";
        }
    }

    private _setTimeLabel() {
        let str = "";
        let time = Math.floor(this.gameOverTime / 1000);
        let minute = Math.floor(time / 60);
        if (minute < 10) {
            str += "0" + minute + ":";
        } else {
            str += minute + ":";
        }
        let second = time % 60;
        if (second < 10) {
            str += "0" + second;
        } else {
            str += second;
        }
        this.timeLabel.string = str;
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}


export interface I_frameData {
    "frameId": number,
    "frameMsg"?: { "uid": number, "msg": { "t": frame_t, [key: string]: any }[] }[]
}

export const enum frame_t {
    randomHurt = 1,     // 随机攻击力
}

