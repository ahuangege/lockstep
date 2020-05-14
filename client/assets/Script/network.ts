import { cmd } from "./cmdClient";


let ws: WebSocket = null;
let route: string[] = [];
let heartbeatTimer: NodeJS.Timeout = null;
let heartbeatResTimeoutTimer: NodeJS.Timeout = null;

let handlers: { [cmdIndex: number]: Function } = {};
let bindedObj: { [cmdIndex: number]: any } = {};
let msgCache: { "id": number, "data": any }[] = [];
let openOrClose = { "open": -1, "close": -2 };
let tmpBuf = { "len": 0, "buffer": new Uint8Array(0) };

export class network {
    /**
     * 连接服务器
     * @param host 
     * @param port 
     */
    static connect(host: string, port: number) {
        network.disconnect();
        tmpBuf = { "len": 0, "buffer": new Uint8Array(0) };
        let url = "ws://" + host + ":" + port;
        ws = new WebSocket(url);
        ws.binaryType = 'arraybuffer';
        ws.onopen = function () {
            // 握手
            let buffer = new Uint8Array(1);
            buffer[0] = 2 & 0xff;
            ws.send(buffer.buffer);

        };

        ws.onerror = function () {
        };

        ws.onclose = function () {
            clearInterval(heartbeatTimer);
            clearTimeout(heartbeatResTimeoutTimer);
            heartbeatResTimeoutTimer = null;
            ws = null;
            msgCache.push({ "id": openOrClose.close, "data": null });
        };
        ws.onmessage = function (event) {
            handleMsg(new Uint8Array(event.data));
        };
    }

    static isConnected() {
        return !!ws;
    }


    /**
     * 断开连接
     */
    static disconnect() {
        if (ws) {
            ws.onopen = function () { };
            ws.onerror = function () { };
            ws.onclose = function () { };
            ws.onmessage = function () { };
            ws.close();
            ws = null;

        }
        msgCache = [];
        clearInterval(heartbeatTimer);
        clearTimeout(heartbeatResTimeoutTimer);
        heartbeatResTimeoutTimer = null;
    }


    /**
     * 添加网络连接成功的消息监听
     * @param cb 
     * @param self 
     */
    static onOpen(cb: (msg?: any) => void, self: any) {
        handlers[openOrClose.open] = cb.bind(self);
        bindedObj[openOrClose.open] = self;
    }

    /**
     * 移除网络连接成功的消息监听
     */
    static offOpen() {
        delete handlers[openOrClose.open];
        delete bindedObj[openOrClose.open];
    }

    /**
     * 添加网络断开的消息监听
     * @param cb 
     * @param self 
     */
    static onClose(cb: () => void, self: any) {
        handlers[openOrClose.close] = cb.bind(self);
        bindedObj[openOrClose.close] = self;
    }

    /**
     * 移除网络断开的消息监听
     */
    static offClose() {
        delete handlers[openOrClose.close];
        delete bindedObj[openOrClose.close];
    }

    /**
     * 添加消息监听
     * @param cmd 
     * @param cb 
     * @param self 
     */
    static addHandler(cmd: cmd, cb: (msg?: any) => void, self: any) {
        let cmdIndex = route.indexOf(cmd);
        if (cmdIndex === -1) {
            console.warn("cmd not exists:", cmd);
            return;
        }
        handlers[cmdIndex] = cb.bind(self);
        bindedObj[cmdIndex] = self;
    }

    // /**
    //  * 移除消息监听
    //  * @param cmd 
    //  */
    // static removeHandler(cmd: cmd) {
    //     let cmdIndex = route.indexOf(cmd);
    //     if (cmdIndex === -1) {
    //         console.warn("cmd not exists:", cmd);
    //         return;
    //     }
    //     delete handlers[cmdIndex];
    //     delete bindedObj[cmdIndex];
    // }

    /**
     * 移除绑定的消息监听
     * @param self 
     */
    static removeThisHandlers(self: any) {
        for (let index in bindedObj) {
            if (bindedObj[index] === self) {
                delete bindedObj[index];
                delete handlers[index];
            }
        }
    }

    /**
     * 发送消息
     * @param cmd 
     * @param data 
     */
    static sendMsg(cmd: cmd, data?: any) {
        if (!ws || ws.readyState !== 1) {
            console.warn("ws is null");
            return;
        }

        let cmdIndex = route.indexOf(cmd);
        if (cmdIndex === -1) {
            console.warn("cmd not exists:", cmd);
            return;
        }
        let buffer = encode(cmdIndex, data);
        ws.send(buffer.buffer);
    }

    /**
     * 读取消息
     */
    static readMsg() {
        if (msgCache.length > 0) {
            let tmp = msgCache.shift();
            if (handlers[tmp.id]) {
                handlers[tmp.id](tmp.data);
            }
        }
    }

}






function encode(cmdIndex: number, data: any) {
    if (data === undefined) {
        data = null;
    }
    let msgArr = strencode(JSON.stringify(data));
    let msg_len = msgArr.length + 3;
    let buffer = new Uint8Array(msg_len);
    let index = 0;
    buffer[index++] = 1 & 0xff;
    buffer[index++] = (cmdIndex >> 8) & 0xff;
    buffer[index++] = cmdIndex & 0xff;
    buffer.set(msgArr, index);
    // copyArray(buffer, index, msgArr, 0, msgArr.length);
    return buffer;
}


function handleMsg(data) {
    try {
        if (data[0] === 1) {
            let endBuf = new Uint8Array(data.length - 3);
            copyArray(endBuf, 0, data, 3, data.length - 3);
            msgCache.push({ "id": (data[1] << 8) | data[2], "data": JSON.parse(strdecode(endBuf)) });
        } else if (data[0] === 2) { //握手
            let endBuf = new Uint8Array(data.length - 1);
            copyArray(endBuf, 0, data, 1, data.length - 1);
            handshakeOver(JSON.parse(strdecode(endBuf)));
        } else if (data[0] === 3) {  // 心跳回调
            clearTimeout(heartbeatResTimeoutTimer);
            heartbeatResTimeoutTimer = null;
        }
    } catch (e) {
        console.log(e);
    }
}

function handshakeOver(msg) {
    route = msg.route;
    if (msg.heartbeat > 0) {
        heartbeatTimer = setInterval(sendHeartbeat, msg.heartbeat * 1000);
    }
    msgCache.push({ "id": openOrClose.open, "data": null })
}

function sendHeartbeat() {
    // 心跳
    let buffer = new Uint8Array(1);
    buffer[0] = 3 & 0xff;
    ws.send(buffer.buffer);

    if (heartbeatResTimeoutTimer === null) {
        heartbeatResTimeoutTimer = setTimeout(function () {
            network.disconnect();
        }, 5 * 1000);
    }
}


function strencode(str: string) {
    let byteArray: number[] = [];
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode <= 0x7f) {
            byteArray.push(charCode);
        } else if (charCode <= 0x7ff) {
            byteArray.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode <= 0xffff) {
            byteArray.push(0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode <= 0x0010ffff) {
            byteArray.push(0xf0 | (charCode >> 18), 0x80 | ((charCode & 0x3f000) >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f));
        }
    }
    return new Uint8Array(byteArray);
}



function strdecode(bytes: Uint8Array) {
    let array: number[] = [];
    let offset = 0;
    let charCode = 0;
    let end = bytes.length;
    while (offset < end) {
        if (bytes[offset] < 128) {
            charCode = bytes[offset];
            offset += 1;
        } else if (bytes[offset] < 224) {
            charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
            offset += 2;
        } else if (bytes[offset] < 240) {
            charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
            offset += 3;
        } else {
            charCode = ((bytes[offset] & 0x07) << 18) + ((bytes[offset + 1] & 0x3f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
            offset += 4;
        }
        array.push(charCode);
    }
    return String.fromCharCode.apply(null, array);
};

function copyArray(dest, doffset, src, soffset, length) {
    for (let index = 0; index < length; index++) {
        dest[doffset++] = src[soffset++];
    }
};
