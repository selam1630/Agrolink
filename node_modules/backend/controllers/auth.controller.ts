import prisma from "../prisma/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET || "agromerce_secret";
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || "";
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || "";
const BASE_URL = "https://api.textbee.dev/api/v1";
const registrationData = new Map<string, any>();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendTextBeeSMS = async (recipient: string, message: string) => {
  try {
    await axios.post(
      `${BASE_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
      {
        recipients: [recipient],
        message: message,
      },
      {
        headers: {
          "x-api-key": TEXTBEE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error sending SMS via TextBee:",
        error.response ? error.response.data : error.message
      );
    } else {
      console.error("Unknown error sending SMS via TextBee:", error);
    }
    return false;
  }
};

/**
 * @route 
 * @description 
 */
export const register = async (req: Request, res: Response) => {
  const { name, phone, email, password, role } = req.body;
  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const conditions: any[] = [{ phone }];
    if (email) conditions.push({ email });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * @route 
 * @description
 */
export const login = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, userId: user.id, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * @route 
 */
export const registerAndSendOtp = async (req: Request, res: Response) => {
  const { name, phone, email, password, role } = req.body;
  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this phone or email already exists" });
    }

    // ===== Step 2: Check Farmer Registry =====
    const farmerInList = await prisma.farmerRegistry.findUnique({
      where: { phone },
    });

    if (!farmerInList) {
      return res.status(403).json({ 
        error: "Your phone is not in the farmer registry. Please contact your local admin." 
      });
    }

    if (farmerInList.isRegistered) {
      return res.status(400).json({ 
        error: "This farmer has already registered." 
      });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    registrationData.set(phone, {
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiresAt,
    });

    const smsSent = await sendTextBeeSMS(
      phone,
      `Agrolink Verification Code: ${otp}. Do not share this code.`
    );

    if (smsSent) {
      return res
        .status(200)
        .json({ message: "OTP sent successfully. Please verify to complete registration." });
    } else {
      registrationData.delete(phone);
      return res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
  } catch (error) {
    console.error("Error during OTP registration:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * @route 
 */
// File: authController.ts

/**
 * @route 
 */
export const verifyAndCompleteRegistration = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required." });
  }

  const storedData = registrationData.get(phone);

  if (!storedData || storedData.otp !== otp || storedData.otpExpiresAt < new Date()) {
    registrationData.delete(phone);
    return res.status(401).json({ error: "Invalid or expired OTP." });
  }

  try {
    const user = await prisma.user.create({
      data: {
        phone,
        name: storedData.name,
        email: storedData.email,
        password: storedData.password,
        role: storedData.role,
        status: "registered", 
      },
    });

    // ===== Step 3: Mark Farmer as Registered =====
    await prisma.farmerRegistry.update({
      where: { phone },
      data: { isRegistered: true },
    });

    registrationData.delete(phone);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Registration complete.",
      token,
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error("Error completing registration:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * @route 
 */
export const loginAndSendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt },
    });

    const smsSent = await sendTextBeeSMS(
      phone,
      `Agrolink Login Code: ${otp}. Do not share this code.`
    );

    if (smsSent) {
      return res
        .status(200)
        .json({ message: "OTP sent successfully. Please verify to log in." });
    } else {
      return res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
  } catch (error) {
    console.error("Error during OTP login request:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * @route 
 */
export const verifyLoginOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null, otpExpiresAt: null },
        });
      }
      return res.status(401).json({ error: "Invalid or expired OTP." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpiresAt: null },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during OTP login verification:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * @route POST /api/auth/register-admin
 * @description Creates a new admin user. Accessible only by a super_admin.
 * @access Private
 */
export const createAdmin = async (req: Request, res: Response) => {
    const { name, phone, email, password } = req.body; 
    if (!name || !phone || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ phone }, { email }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User with this phone or email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.user.create({
            data: {
                name,
                phone,
                email,
                password: hashedPassword,
                role: 'admin', 
                status: 'registered',
            },
        });

        res.status(201).json({ 
            message: "Admin user created successfully", 
            userId: newAdmin.id 
        });

    } catch (error) {
        console.error("Error creating admin user:", error);
        res.status(500).json({ error: "Failed to create admin user" });
    }
};
/**
 * @route 
 */
export const logout = (req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful" });
};
