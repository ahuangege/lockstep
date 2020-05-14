import { Application, Session } from "mydog";
import { Player } from "./player";
import { removeFromArr } from "./util";
import { Room } from "./room";

export class RoomMgr {
    private app: Application;
    private uid: number = 1;    //玩家uid
    private roles: DicObj<Player> = {}; // 玩家集合
    private roomId: number = 1;     // 房间id
    private rooms: DicObj<Room> = {};   // 房间集合
    private matchList: Player[] = [];   // 匹配列表
    private movieId: number = 1;     // 录像id
    private movies: { "id": number, "time": string, "nameArr": string[], "data": any }[] = [];

    constructor(app: Application) {
        this.app = app;
        setInterval(this.matchInterval.bind(this), 1000);
    }

    getRole(uid: number) {
        return this.roles[uid];
    }

    getRoom(roomId: number) {
        return this.rooms[roomId];
    }

    getPlayer(roomId: number, uid: number) {
        return this.getRoom(roomId).getPlayer(uid);
    }

    enter(nickname: string) {
        let uid = this.uid++;
        let p = new Player(uid, nickname);
        this.roles[uid] = p;
        return uid;
    }

    match(uid: number) {
        let role = this.getRole(uid);
        if (role.isMatching) {
            role.isMatching = false;
            removeFromArr(this.matchList, role);
            return { "isMatching": false };
        }
        role.isMatching = true;
        this.matchList.unshift(role);
        return { "isMatching": true };
    }

    onUserLeave(session: Session) {
        let role = this.getRole(session.uid);
        let roomId = session.get("roomId");
        if (role.isMatching) {
            removeFromArr(this.matchList, role);
        } else if (roomId) {
            let room = this.getRoom(roomId);
            room.userLeave(session.uid);
        }
        delete this.roles[session.uid];
    }


    private matchInterval() {
        for (let i = this.matchList.length - 2; i >= 0; i -= 2) {
            let p1 = this.matchList.pop() as Player;
            let p2 = this.matchList.pop() as Player;

            let roomId = this.roomId++;
            let room = new Room(roomId, this.app);
            this.rooms[roomId] = room;
            room.init([p1, p2]);
        }
    }

    delRoom(roomId: number) {
        delete this.rooms[roomId];
        console.log("房间销毁", roomId);
    }

    newMovie(data: any, nameArr: string[]) {
        this.movies.push({ "id": this.movieId++, "time": new Date().toLocaleString(), "nameArr": nameArr, "data": data });
        if (this.movies.length > 15) {
            this.movies.splice(10);
        }
    }

    getMovieList() {
        let arr: any[] = [];
        for (let one of this.movies) {
            arr.push({ "id": one.id, "time": one.time, "nameArr": one.nameArr });
        }
        return { "list": arr };
    }

    getMovieData(id: number) {
        for (let one of this.movies) {
            if (one.id === id) {
                return one.data;
            }
        }
        return null;
    }
}

export interface DicObj<T = any> {
    [key: string]: T
}