import { Application } from "mydog";
import { Player } from "./player";
import { cmd } from "../config/cmd";
import { removeFromArr } from "./util";
import { RoomMgr } from "./roomMgr";


export class Room {
    private roomId: number;
    app: Application;
    private timer: NodeJS.Timer = null as any;
    private players: Player[] = [];
    private uids: number[] = [];
    private frameId = 1;
    private randomSeed: number = 0;
    private startData: any = null;
    private frames: I_frameData[] = [];
    constructor(roomId: number, app: Application) {
        this.roomId = roomId;
        this.app = app;
        this.timer = setInterval(this.update.bind(this), 1000 / 5);
        this.randomSeed = Math.floor(Math.random() * 100000);
    }

    init(players: Player[]) {
        this.players = players;
        let arr: { "nickname": string, "uid": number }[] = [];
        for (let one of this.players) {
            let session = this.app.getSession(one.uid);
            session.set({ "roomId": this.roomId });
            one.isMatching = false;
            this.uids.push(one.uid);
            arr.push({ "uid": one.uid, "nickname": one.nickname });
        }
        this.startData = { "randomSeed": this.randomSeed, "players": arr };
        this.sendMsgToAll(cmd.onStartGame, this.startData);
    }

    getPlayer(uid: number): Player {
        for (let one of this.players) {
            if (one.uid === uid) {
                return one;
            }
        }
        return null as any;
    }

    userLeave(uid: number) {
        let p = this.getPlayer(uid);
        removeFromArr(this.uids, uid);
        if (this.uids.length === 0) {
            clearInterval(this.timer);
            this.app.get<RoomMgr>("roomMgr").delRoom(this.roomId);
        }
    }

    private update() {
        this.sendFrame();
    }

    private sendFrame() {
        let msg: I_frameData = { "frameId": this.frameId };
        this.frameId++;
        let frameMsg: any[] = [];
        for (let one of this.players) {
            let pArr = one.getFrameMsg();
            if (pArr.length > 0) {
                frameMsg.push({ "uid": one.uid, "msg": pArr });
            }
        }
        if (frameMsg.length > 0) {
            msg.frameMsg = frameMsg;
        }
        this.frames.push(msg);
        this.sendMsgToAll(cmd.onFrame, msg);
    }

    private sendMsgToAll(route: cmd, msg?: any) {
        this.app.sendMsgByUid(route, msg, this.uids);
    }

    gameOver() {
        clearInterval(this.timer);
        let nameArr: string[] = [];
        for (let one of this.players) {
            let session = this.app.getSession(one.uid);
            session.set({ "roomId": 0 });
            nameArr.push(one.nickname);
        }
        let roomMgr = this.app.get<RoomMgr>("roomMgr");
        roomMgr.delRoom(this.roomId);
        roomMgr.newMovie({ "startData": this.startData, "frames": this.frames }, nameArr);
    }
}

interface I_frameData {
    "frameId": number,
    "frameMsg"?: { "uid": number, "msg": any[] }[]
}