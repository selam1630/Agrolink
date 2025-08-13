"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'agromerce_secret';
const protect = (roles) => {
    return (req, res, next) => {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Unauthorized' });
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
};
exports.protect = protect;
