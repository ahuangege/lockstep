// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Entity } from "./entity";
import { Game } from "./game";
import { Decimal } from "./Decimal";

const { ccclass, property } = cc._decorator;

let kScale = new Decimal(1000);
@ccclass
export class Monster extends Entity {
    public f_x: number;
    private blood = 100;
    private speed = 50;
    private bloodLabel: cc.Label;
    onLoad() {
        this.bloodLabel = this.node.getChildByName("blood").getComponent(cc.Label);
    }
    init() {
        this.node.setPosition(-400, 0);
        this.f_x = -400;
        this.setBloodLabel();
    }

    updateF(dt: number) {
        this.f_x += new Decimal(this.speed * dt).div(kScale).floor();
        if (this.f_x > 400) {
            this.die();
        }
    }

    update() {
        this.node.x = cc.misc.lerp(this.node.x, this.f_x, 0.1);
    }

    die() {
        Game.instance._delMonster(this);
        this.setAlive(false);
        this.node.destroy();
    }

    getHurt(uid: number, hurt: number) {
        this.blood -= hurt;
        Game.instance._getPlayer(uid).addAllHurt(hurt);
        this.setBloodLabel();
        if (this.blood <= 0) {
            this.die();
        }
    }

    private setBloodLabel() {
        this.bloodLabel.string = this.blood.toString();
    }
}
