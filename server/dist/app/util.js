"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromArr = void 0;
function removeFromArr(arr, one) {
    var index = arr.indexOf(one);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}
exports.removeFromArr = removeFromArr;
