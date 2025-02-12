"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const db_1 = __importDefault(require("../config/db"));
const jwtUtils_1 = require("../utils/jwtUtils");
const passwordUtils_1 = require("../utils/passwordUtils");
const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const emailExists = await db_1.default.user.findUnique({ where: { email } });
        if (emailExists) {
            res.status(409).json({ message: "Email already exists" });
            return;
        }
        const hashedPassword = await (0, passwordUtils_1.hashPassword)(password);
        const user = await db_1.default.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ message: "User created successfully", user: user.email });
    }
    catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isValidPassword = await (0, passwordUtils_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = (0, jwtUtils_1.generateToken)(user.id);
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.signin = signin;
