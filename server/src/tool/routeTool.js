"use strict";
exports.__esModule = true;
var routePath = "../config/sys/route.ts";
var serverPath = "../config/cmd.ts";
var clientCsPath = "../config/Route.cs";
var clientJsPath = "../config/cmd.js";
var clientTsPath = "../config/cmdClient.ts";
var fs = require("fs");
var readline = require("readline");
var path = require("path");
var readStream = fs.createReadStream(path.join(__dirname, routePath));
var read_l = readline.createInterface({ "input": readStream });
var hasStart = false;
var cmdObjArr = [];
read_l.on("line", function (line) {
    line = line.trim();
    if (line === "") {
        return;
    }
    if (!hasStart) {
        if (line.indexOf("export") === 0)
            hasStart = true;
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
    var index = line.indexOf('"');
    if (index === -1) {
        return;
    }
    var cmd = line.substring(0, index);
    var note = "";
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
    var endStr = 'public class Route\n{\n';
    var jsEndStr = 'module.exports = {\n';
    var tsEndStr = "export const enum cmd {\n";
    for (var _i = 0, cmdObjArr_1 = cmdObjArr; _i < cmdObjArr_1.length; _i++) {
        var one = cmdObjArr_1[_i];
        if (one.note) {
            endStr += "    /// <summary>\n    /// " + one.note + "\n    /// </summary>\n";
            jsEndStr += "    /**\n     * " + one.note + "\n     */\n";
            tsEndStr += "    /**\n     * " + one.note + "\n     */\n";
        }
        var oneStr = one.cmd;
        var oneJsStr = one.cmd;
        var oneTsStr = one.cmd;
        if (one.cmd.indexOf('.') !== -1) {
            var tmpArr = one.cmd.split('.');
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
    var endStr = 'export const enum cmd {\n';
    for (var _i = 0, cmdObjArr_2 = cmdObjArr; _i < cmdObjArr_2.length; _i++) {
        var one = cmdObjArr_2[_i];
        if (one.cmd.indexOf('.') === -1) {
            if (one.note) {
                endStr += "    /**\n     * " + one.note + "\n     */\n";
            }
            endStr += "    " + one.cmd + ' = "' + one.cmd + '",\n';
        }
    }
    endStr += '}';
    var tsFilename = path.join(__dirname, serverPath);
    fs.writeFileSync(tsFilename, endStr);
}
