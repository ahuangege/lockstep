import { Entity } from "./entity";
import { Monster } from "./monster";
import { f_Math } from "./util";
import { Game } from "./game";

const { ccclass, property } = cc._decorator;


@ccclass
export class Bullet extends Entity {

    private f_x: number = 0;
    private f_y: number = 0;
    private speed: number = 700;
    private target: Monster = null;
    private hurt: number = 0;
    private uid: number = 0;

    init(pos: cc.Vec2, target: Monster, hurt: number, uid: number) {
        this.node.position = pos;
        this.target = target;
        this.f_x = pos.x;
        this.f_y = pos.y;
        this.hurt = hurt;
        this.uid = uid;
    }

    updateF(dt: number) {
        if (!this.target.alive) {
            this.die();
            return;
        }
        let x1 = this.target.f_x - this.f_x;
        let y1 = 0 - this.f_y;
        let len2 = x1 * x1 + y1 * y1;
        if (len2 < 2500) {
            this.target.getHurt(this.uid, this.hurt);
            this.die();
            return;
        }
        let angle = f_Math.atan2(y1, x1);
        let delta = Math.floor(this.speed * dt / 1000);
        this.f_x += Math.floor(delta * f_Math.cos(angle));
        this.f_y += Math.floor(delta * f_Math.sin(angle));
    }

    update() {
        this.node.x = cc.misc.lerp(this.node.x, this.f_x, 0.1);
        this.node.y = cc.misc.lerp(this.node.y, this.f_y, 0.1);
    }


    die() {
        Game.instance._delBullet(this);
        this.alive = false;
        this.node.destroy();
    }
}
