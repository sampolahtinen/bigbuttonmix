"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = express_1.default();
const allowList = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://bigbuttonmix-client.vercel.app/',
    'https://big-button-mix.herokuapp.com/'
];
app.use(cors_1.default({
    origin: allowList,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cookie_parser_1.default());
app.use(routes_1.randomSoundcloudTrackRoute);
if (utils_1.isDev) {
    app.listen(constants_1.PORT, () => {
        console.log(`Server listening at http://localhost:${constants_1.PORT}`);
    });
}
//# sourceMappingURL=server.js.map