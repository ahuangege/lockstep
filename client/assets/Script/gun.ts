// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Monster } from "./monster";
import { isAlive, f_Math } from "./util";
import { Player } from "./player";
import { Game } from "./game";

const { ccclass, property } = cc._decorator;

@ccclass
export class Gun extends cc.Component {
    private player: Player;
    private uid: number;
    private pos: cc.Vec2;
    private target: Monster = null;
    private changeTime = 1000;
    private shootTime = 0;
    init(p: Player, uid: number) {
        this.player = p;
        this.uid = uid;
        this.pos = cc.v2(Math.floor(this.node.x), Math.floor(this.node.y));
    }

    updateF(dt: number) {
        if (!isAlive(this.target)) {
            this.target = Game.instance._getRandomMonster();
            return;
        }

        this.changeTime -= dt;
        if (this.changeTime <= 0) {
            this.changeTime = f_Math.randArrElement([1000, 3000, 5000]);
            this.target = Game.instance._getRandomMonster();
        }
        this.shootTime -= dt;
        if (this.shootTime <= 0) {
            this.shootTime = 1000;
            Game.instance._createBullet(this.pos, this.target, this.player.hurt, this.player.uid);
        }
    }
}
