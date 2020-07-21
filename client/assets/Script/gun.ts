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
    private f_x: number;
    private f_y: number;
    private target: Monster = null;
    private changeTime = 1000;
    private shootTime = 0;
    init(p: Player, uid: number, isDown: boolean) {
        this.player = p;
        this.uid = uid;
        this.f_x = 0;
        this.f_y = isDown ? -200 : 200;
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
            Game.instance._createBullet(this.f_x, this.f_y, this.target, this.player.hurt, this.player.uid);
        }
    }
}

