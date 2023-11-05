const { ccclass, property } = cc._decorator;


@ccclass
export class Entity extends cc.Component {
    private _alive = true;

    public get alive() {
        return this._alive;
    }

    public setAlive(alive: boolean) {
        this._alive = alive;
    }
}
