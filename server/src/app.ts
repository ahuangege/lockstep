
import { createApp, connector } from "mydog";
let app = createApp();

import { RoomMgr } from "./app/roomMgr";
import { onUserLeave } from "./servers/gate/handler/main";


app.setConfig("connector", { "connector": connector.Ws, clientOffCb: onUserLeave })
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode })

app.configure("gate", () => {
    app.set("roomMgr", new RoomMgr(app));
});


app.start();

process.on("uncaughtException", function (err: any) {
    console.log(err)
});


function msgDecode(cmdId: number, msgBuf: Buffer) {
    let msg = msgBuf.toString();
    console.log("--->>>", app.routeConfig[cmdId], msg);
    return JSON.parse(msg);
}

function msgEncode(cmdId: number, msg: any) {
    let msgStr = JSON.stringify(msg);
    console.log("<<<---", app.routeConfig[cmdId], msgStr);
    return Buffer.from(msgStr);
}