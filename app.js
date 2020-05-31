"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mesa_1 = __importStar(require("@cryb/mesa"));
const orchid_1 = require("@augu/orchid");
const orchid = new orchid_1.HttpClient();
const mesa = new mesa_1.default({
    port: 8000,
    redis: 'redis://localhost:6379',
    sync: {
        enabled: true
    },
    authentication: {
        storeConnectedUsers: true
    }
});
const dispatcher = new mesa_1.Dispatcher('redis://localhost:6379');
mesa.on('connection', client => {
    client.authenticate(async ({ token }, done) => {
        try {
            const user = await orchid.request({
                method: 'GET',
                url: 'https://api.voxel.bar/v2/users/@me',
                headers: {
                    authorization: token
                }
            }).execute();
            const req = user.json();
            done(null, { id: req.id, user: req });
        }
        catch (err) {
            done(err);
        }
        console.log(`New connection from (${client.id} ${client.user.username}@${client.user.tag})`);
    });
    client.on('message', message => {
        const { data, type } = message;
        console.log('Recieved', data, type, 'from', client.id || 'client')
    });
    client.on('disconnect', ({ code, reason }) => {
        console.log(`Client (${client.id} ${client.user ? client.user.username : 'undefined'}@${client.user ? client.user.tag : 'undefined'}) disconnected with ${code} ${reason ? `with reason ${reason}` : ''}`);
    });
});

console.log('Websocket server is running');
