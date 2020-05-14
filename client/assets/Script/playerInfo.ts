import { I_frameData } from "./game";

const { ccclass, property } = cc._decorator;

export class PlayerInfo {
    static uid = 0;
    static nickname = "";
    static isMovie = false;
    static startGameData: { "randomSeed": number, "players": { "uid": number, "nickname": string }[] } = null;
    static frames: I_frameData[] = [];
}