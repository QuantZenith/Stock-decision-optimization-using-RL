import express from "express";
import {
  getAccount,
  createOrder,
  getOrders,
  getPositions,
  getPortfolio,
  resetAccount,
} from "../controllers/tradingController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Account routes
router.get("/account", isAuthenticatedUser, getAccount);
router.post("/account/reset", isAuthenticatedUser, resetAccount);

// Order routes
router.post("/orders", isAuthenticatedUser, createOrder);
router.get("/orders", isAuthenticatedUser, getOrders);

// Position routes
router.get("/positions", isAuthenticatedUser, getPositions);

// Portfolio routes
router.get("/portfolio", isAuthenticatedUser, getPortfolio);

export default router;
