import { Entity } from "./entity";
import { Monster } from "./monster";
import { f_Math } from "./util";
import { Game } from "./game";
import { Decimal } from "./Decimal";

const { ccclass, property } = cc._decorator;

let kScale = new Decimal(1000);
@ccclass
export class Bullet extends Entity {

    private f_x: number;
    private f_y: number;
    private speed = 700;
    private target: Monster = null;
    private hurt: number = 0;
    private uid: number = 0;

    init(x: number, y: number, target: Monster, hurt: number, uid: number) {
        this.node.x = x;
        this.node.y = y;
        this.target = target;
        this.f_x = x;
        this.f_y = y;
        this.hurt = hurt;
        this.uid = uid;
    }

    updateF(dt: number) {
        if (!this.target.alive) {
            this.die();
            return;
        }
        let dx = this.target.f_x - this.f_x;
        let dy = 0 - this.f_y;
        if (dx * dx + dy * dy < 2500) {
            this.target.getHurt(this.uid, this.hurt);
            this.die();
            return;
        }
        let angle = f_Math.atan2(dy, dx);
        let delta = new Decimal(this.speed * dt).div(kScale);
        this.f_x += delta.mul(f_Math.cos(angle)).floor();
        this.f_y += delta.mul(f_Math.sin(angle)).floor();
    }

    update() {
        this.node.x = cc.misc.lerp(this.node.x, this.f_x, 0.1);
        this.node.y = cc.misc.lerp(this.node.y, this.f_y, 0.1);
    }


    die() {
        Game.instance._delBullet(this);
        this.setAlive(false);
        this.node.destroy();
    }
}
