import express from "express";
import {
  getClosingPrice,
  getMarketStatus,
  getLivePrice,
} from "../controllers/marketController.js";

const router = express.Router();

// Market data routes (public - no auth required)
router.get("/closing-price", getClosingPrice);
router.get("/status", getMarketStatus);
router.get("/live-price", getLivePrice);

export default router;
