"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProduct = void 0;
const prisma_1 = __importDefault(require("../prisma/prisma"));
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    try {
        if (phone) {
            const { name, quantity } = req.body;
            if (!name || quantity === undefined) {
                return res.status(400).json({ error: 'Missing product name or quantity for text-based request.' });
            }
            const user = yield prisma_1.default.user.findUnique({ where: { phone } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const product = yield prisma_1.default.product.create({
                data: {
                    name,
                    quantity,
                    userId: user.id,
                },
            });
            return res.status(201).json({ message: 'Product added via SMS', product });
        }
        else {
            const { name, quantity, price, description, imageUrl, userId } = req.body;
            if (!name || quantity === undefined || price === undefined || !imageUrl || !userId) {
                return res.status(400).json({ error: 'Missing required product fields: name, quantity, price, imageUrl, or userId.' });
            }
            const product = yield prisma_1.default.product.create({
                data: {
                    name,
                    quantity: parseInt(quantity, 10),
                    price: parseFloat(price),
                    description,
                    imageUrl,
                    userId,
                },
            });
            return res.status(201).json({ message: 'Product posted with image successfully!', product });
        }
    }
    catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.addProduct = addProduct;
