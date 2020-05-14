import { network } from "./network";
import { cmd } from "./cmdClient";
import { Main } from "./main";

const { ccclass, property } = cc._decorator;

@ccclass
export class MoviePrefab extends cc.Component {
    private id: number = 0;
    init(info: { "id": number, "time": string, "nameArr": string[] }) {
        this.node.name = info.id.toString();
        this.id = info.id;
        this.node.getChildByName("time").getComponent(cc.Label).string = info.time;
        this.node.getChildByName("name1").getComponent(cc.Label).string = info.nameArr[0];
        this.node.getChildByName("name2").getComponent(cc.Label).string = info.nameArr[1];
    }

    btn_look() {
        if (!Main.instance.isMatching) {
            network.sendMsg(cmd.gate_main_getMovieData, { "id": this.id });
        }
    }
}
