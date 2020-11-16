"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "development": {
        "gate": [
            { "id": "gate-server-1", "host": "127.0.0.1", "port": 4010, "frontend": true, "clientPort": 4001 }
        ]
    },
    "production": {
        "gate": [
            { "id": "gate-server-1", "host": "127.0.0.1", "port": 4010, "frontend": true, "clientPort": 4001 }
        ]
    }
};
