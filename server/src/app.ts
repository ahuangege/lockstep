
import { createApp, Application, Session, connector } from "mydog";
import { RoomMgr } from "./app/roomMgr";
let app = createApp();


app.setConnectorConfig({ "connector": connector.connectorWs })
app.setEncodeDecodeConfig({ "msgDecode": msgDecode, "msgEncode": msgEncode })

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
    if (msg === undefined) {
        msg = null;
    }
    let msgStr = JSON.stringify(msg);
    console.log("---rsp---", app.routeConfig[cmdId], msgStr);
    return Buffer.from(msgStr);
}