import { Room } from "./room";


export class Player {
    uid: number;
    nickname: string;
    isMatching: boolean = false;
    private msgArr: any[] = [];
    constructor(uid: number, nickname: string) {
        this.uid = uid;
        this.nickname = nickname;
    }

    frameMsg(msg: { t: number, [key: string]: any, }) {
        this.msgArr.push(msg);
    }

    getFrameMsg() {
        let arr = this.msgArr;
        this.msgArr = [];
        return arr;
    }
}
