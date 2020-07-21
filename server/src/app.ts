
import { createApp, connector } from "mydog";
let app = createApp();
import { RoomMgr } from "./app/roomMgr";


app.setConfig("connector", { "connector": connector.connectorWs })
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode })

app.configure("gate", () => {
    app.set("roomMgr", new RoomMgr(app));
});

app.onLog(function (level, info) {
    // console.log(app.serverId, info)
})

app.start();

process.on("uncaughtException", function (err: any) {
    console.log(err)
});


function msgDecode(cmdId: number, msgBuf: Buffer) {
    let msg = msgBuf.toString();
    console.log("---req---", app.routeConfig[cmdId], msg);
    return JSON.parse(msg);
}

function msgEncode(cmdId: number, msg: any) {
    let msgStr = JSON.stringify(msg);
    console.log("---rsp---", app.routeConfig[cmdId], msgStr);
    return Buffer.from(msgStr);
}