// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import * as util from "./util";
import { Gun } from "./gun";
import { Decimal } from "./Decimal";

@ccclass
export class Player extends cc.Component {
    public uid: number = 0;
    private gun: Gun;
    public hurt: number = 1;
    private allHurt: number = 0;
    private hurtLabel: cc.Label;
    private allHurtLabel: cc.Label;

    onLoad() {
        this.hurtLabel = this.node.getChildByName("hurt").getComponent(cc.Label);
        this.allHurtLabel = this.node.getChildByName("allHurt").getComponent(cc.Label);
    }

    init(uid: number, nickname: string, isDown: boolean) {
        this.uid = uid;
        util.getChildByName(this.node, "name").getComponent(cc.Label).string = nickname;
        this.gun = util.getChildByName(this.node, "gun").getComponent(Gun);
        this.gun.init(this, uid, isDown);
    }

    updateF(dt: number) {
        this.gun.updateF(dt);
    }

    /**
     * 随机攻击力
     */
    randomHurt() {
        let hurt = util.f_Math.randIntNum(10);
        while (hurt === this.hurt) {
            hurt = util.f_Math.randIntNum(10);
        }
        this.hurt = hurt;
        this.hurtLabel.string = this.hurt.toString();
    }

    /**
     * 总伤害统计
     */
    addAllHurt(hurt: number) {
        this.allHurt += hurt;
        this.allHurtLabel.string = "总伤害:" + this.allHurt;
    }
}
