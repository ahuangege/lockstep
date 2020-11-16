import { Application, Session, app } from "mydog";
import { RoomMgr } from "../../../app/roomMgr";



export default class Handler {
    app: Application;
    roomMgr: RoomMgr;
    constructor(app: Application) {
        this.app = app;
        this.roomMgr = app.get("roomMgr");
    }


    enter(msg: { "nickname": string }, session: Session, next: Function) {
        if (session.uid) {
            return;
        }
        let uid = this.roomMgr.enter(msg.nickname);
        session.bind(uid);
        next({ "uid": uid, "nickname": msg.nickname });
    }

    matchOrNot(msg: any, session: Session, next: Function) {
        if (session.get("roomId")) {
            return;
        }
        let res = this.roomMgr.match(session.uid);
        next(res);
    }

    frameMsg(msg: any, session: Session, next: Function) {
        let room = this.roomMgr.getRoom(session.get("roomId"));
        if (!room) {
            return;
        }
        let p = room.getPlayer(session.uid);
        p.frameMsg(msg);
    }

    gameOver(msg: any, session: Session, next: Function) {
        let room = this.roomMgr.getRoom(session.get("roomId"));
        if (!room) {
            return;
        }
        room.gameOver();
    }

    getMovieList(msg: any, session: Session, next: Function) {
        next(this.roomMgr.getMovieList());
    }

    getMovieData(msg: { id: number }, session: Session, next: Function) {
        next({ "id": msg.id, "data": this.roomMgr.getMovieData(msg.id) });
    }
}

export function onUserLeave(session: Session) {
    let uid = session.uid;
    if (!uid) {
        return;
    }
    console.log("leave", uid)
    let roomMgr = app.get<RoomMgr>("roomMgr");
    roomMgr.onUserLeave(session);
}