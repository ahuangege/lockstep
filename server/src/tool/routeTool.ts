let routePath = "../config/sys/route.ts";

let serverPath = "../config/cmd.ts";
let clientCsPath = "../config/Route.cs"
let clientJsPath = "../config/cmd.js"
let clientTsPath = "../config/cmdClient.ts"


import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

let readStream = fs.createReadStream(path.join(__dirname, routePath));

let read_l = readline.createInterface({ "input": readStream });

let hasStart = false;
let cmdObjArr: { "cmd": string, "note": string }[] = [];

read_l.on("line", function (line) {
    line = line.trim();
    if (line === "") {
        return;
    }
    if (!hasStart) {
        if (line.indexOf("export") === 0) hasStart = true;
        return;
    }
    if (line.indexOf("]") === 0) {
        clientCmd();
        serverCmd();
        read_l.close();
        return;
    }
    if (line.indexOf('"') !== 0) {
        return;
    }
    line = line.substring(1);
    let index = line.indexOf('"');
    if (index === -1) {
        return;
    }

    let cmd = line.substring(0, index);
    let note = "";
    index = line.indexOf("//");
    if (index !== -1) {
        note = line.substring(index + 2).trim();
    }
    cmdObjArr.push({ "cmd": cmd, "note": note });
});

read_l.on("close", function () {
    console.log("build route ok!");
});


function clientCmd() {
    let endStr = 'public class Route\n{\n';
    let jsEndStr = 'module.exports = {\n';
    let tsEndStr = "export const enum cmd {\n"
    for (let one of cmdObjArr) {
        if (one.note) {
            endStr += "    /// <summary>\n    /// " + one.note + "\n    /// </summary>\n";
            jsEndStr += "    /**\n     * " + one.note + "\n     */\n";
            tsEndStr += "    /**\n     * " + one.note + "\n     */\n";
        }
        let oneStr = one.cmd;
        let oneJsStr = one.cmd;
        let oneTsStr = one.cmd;
        if (one.cmd.indexOf('.') !== -1) {
            let tmpArr = one.cmd.split('.');
            oneStr = tmpArr[0] + '_' + tmpArr[1] + '_' + tmpArr[2];
            oneJsStr = tmpArr[0] + '_' + tmpArr[1] + '_' + tmpArr[2];
            oneTsStr = tmpArr[0] + '_' + tmpArr[1] + '_' + tmpArr[2];
        }
        endStr += '    public const string ' + oneStr + ' = "' + one.cmd + '";\n';
        jsEndStr += '    ' + oneJsStr + ': \"' + one.cmd + '",\n';
        tsEndStr += '    ' + oneTsStr + ' = "' + one.cmd + '",\n';
    }
    endStr += '}';
    jsEndStr += '}';
    tsEndStr += '}';

    // fs.writeFileSync(path.join(__dirname, clientCsPath), endStr);
    // fs.writeFileSync(path.join(__dirnam1e, clientJsPath), jsEndStr);
    fs.writeFileSync(path.join(__dirname, clientTsPath), tsEndStr);
}

function serverCmd() {
    let endStr = 'export const enum cmd {\n'
    for (let one of cmdObjArr) {
        if (one.cmd.indexOf('.') === -1) {
            if (one.note) {
                endStr += "    /**\n     * " + one.note + "\n     */\n";
            }
            endStr += "    " + one.cmd + ' = "' + one.cmd + '",\n';
        }
    }
    endStr += '}';

    let tsFilename = path.join(__dirname, serverPath);
    fs.writeFileSync(tsFilename, endStr);
}