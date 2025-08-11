"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const sms_route_1 = __importDefault(require("./routes/sms.route"));
const product_route_1 = __importDefault(require("./routes/product.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use('/api/auth', auth_route_1.default);
app.use('/api/sms', sms_route_1.default);
app.use('/api/products', product_route_1.default);
exports.default = app;
