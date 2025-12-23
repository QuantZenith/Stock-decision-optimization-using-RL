// server/routes/signal.js (only this file; other imports unchanged)
import express from 'express';

import {
  EXPECTED_OBS_LEN,
  ACCOUNT_SIZE,
  DEFAULT_ORDER_VALUE,
  MAX_POSITION_PCT,
  MIN_TIME_BETWEEN_TRADES_SECS,
  MAX_TRADES_PER_DAY,
} from '../config.js';

import {
  predict as modelPredict,
  predictFromCloses as modelPredictFromCloses,
} from '../services/modelClient.js';

import { placeOrder } from '../services/executionAdapter.js';

import Decision from '../models/Decision.js';
import Order from '../models/Order.js';
import Position from '../models/Position.js';

const router = express.Router();

function nowISO() {
  return new Date().toISOString();
}

function computeQuantity(price) {
  if (!price || price <= 0) return 1;
  const qty = Math.floor(DEFAULT_ORDER_VALUE / price);
  return Math.max(qty, 1);
}

async function checkMinTime(symbol) {
   return true;
  
}

async function checkMaxTradesPerDay() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const count = await Decision.countDocuments({ createdAt: { $gte: start } }).exec();
  return count < MAX_TRADES_PER_DAY;
}

async function checkMaxPosition(symbol, price, additionalQty = 0) {
  const pos = await Position.findOne({ symbol }).exec();
  const currentQty = pos ? pos.qty : 0;
  const newQty = Math.abs(currentQty + additionalQty);
  const newPositionValue = newQty * price;
  return newPositionValue <= MAX_POSITION_PCT * ACCOUNT_SIZE;
}

// server/routes/signal.js  (only the router.post part changed)
router.post('/signal', async (req, res) => {
  const logger = req.app.locals.logger;
  const io = req.app.locals.io;
  console.log("api requested");
  try {
    const {
      obs,
      closes,
      // position = 0,  // <-- no longer taken from body
      symbol = 'UNKNOWN',
      price = null,
      dryRun = true,
    } = req.body;

    // Debug: basic input sanity and stats
    try {
      if (Array.isArray(closes)) {
        const n = closes.length;
        const head = closes.slice(0, 5).map(x => Number(x).toFixed(2));
        const tail = closes.slice(-5).map(x => Number(x).toFixed(2));
        const uniqCount = new Set(closes.map(x => Number(x).toFixed(2))).size;
        logger.info(`[Signal][INPUT] ${symbol} closes n=${n} uniq=${uniqCount} head=${head.join(',')} tail=${tail.join(',')}`);
        if (n >= 2) {
          const rets = [];
          for (let i = 1; i < n; i++) {
            const prev = Number(closes[i-1]);
            const curr = Number(closes[i]);
            if (prev !== 0) rets.push((curr - prev) / prev);
          }
          if (rets.length) {
            const mean = rets.reduce((a,b)=>a+b,0)/rets.length;
            const variance = rets.reduce((a,b)=>a + Math.pow(b-mean,2),0)/rets.length;
            const std = Math.sqrt(variance);
            const zeros = rets.filter(r => Math.abs(r) < 1e-9).length;
            logger.info(`[Signal][RET_STATS] ${symbol} mean=${mean.toExponential(3)} std=${std.toExponential(3)} zeros=${zeros}/${rets.length}`);
            if (std < 1e-6) {
              logger.warn(`[Signal][RET_STATS] ${symbol} returns nearly flat; model likely to HOLD`);
            }
          }
        }
      } else if (Array.isArray(obs)) {
        const head = obs.slice(0,5).map(x => Number(x).toExponential(3));
        const tail = obs.slice(-5).map(x => Number(x).toExponential(3));
        logger.info(`[Signal][INPUT] ${symbol} obs len=${obs.length} head=${head.join(',')} tail=${tail.join(',')}`);
      }
    } catch (e) {
      logger.warn(`[Signal][INPUT] Failed to log input stats: ${e?.message || e}`);
    }

    let modelResp;
    let inputForStorage;
    let inputType;

    // --- 1) Determine position flag from DB (real position state) ---
    // position_flag = 0 (flat) or 1 (long). For now we ignore shorts.
    let positionFlag = 0;
    const currentPos = await Position.findOne({ symbol }).exec();
    if (currentPos && currentPos.qty > 0) {
      positionFlag = 1;
    } else {
      positionFlag = 0;
    }

    // --- 2) Prefer closes-based input if provided ---
    if (Array.isArray(closes) && closes.length >= 2) {
      // use /predict_from_closes with computed positionFlag
      modelResp = await modelPredictFromCloses(closes, positionFlag);
      inputForStorage = closes;
      inputType = 'closes';
    } else if (Array.isArray(obs) && obs.length === EXPECTED_OBS_LEN) {
      // Fallback to raw-obs mode (old behavior)
      modelResp = await modelPredict(obs);
      inputForStorage = obs;
      inputType = 'obs';
    } else {
      return res.status(400).json({
        error:
          "Invalid input: provide either 'closes' (>=2 prices) or 'obs' with correct length.",
      });
    }

    const action = modelResp.action;

    // Debug: log the chosen action for traceability
    logger.info(`[Signal][ACTION] ${symbol} → action=${action} (0=HOLD,1=BUY,2=SELL)`);

    const decisionDoc = await Decision.create({
      symbol,
      obs: inputForStorage, // store what we used as input
      action,
      meta: {
        modelLatencyMs: modelResp.latency_ms,
        inputType,
        positionFlag,
        createdAt: nowISO(),
      },
    });

    io.emit('decision', {
      id: decisionDoc._id,
      symbol,
      action,
      createdAt: decisionDoc.createdAt,
    });
    
    logger.info(`[Signal] Decision emitted via socket: ${symbol} action=${action}`);

    // --- 3) Risk checks as before ---
    // if (!(await checkMaxTradesPerDay())) {
    //   logger.info('Max trades per day exceeded');
    //   return res
    //     .status(403)
    //     .json({ error: 'Max trades per day limit reached', decisionId: decisionDoc._id });
    // }

    if (!(await checkMinTime(symbol))) {
      logger.info(`Min time between trades violated for ${symbol}`);
      return res
        .status(403)
        .json({ error: 'Too soon to trade the same symbol', decisionId: decisionDoc._id });
    }

    if (action === 0) {
      return res.json({ result: 'HOLD', decisionId: decisionDoc._id });
    }

    const side = action === 1 ? 'BUY' : 'SELL';
    const priceVal = Number(price) || 1.0;
    const qty = computeQuantity(priceVal);

    // if (!(await checkMaxPosition(symbol, priceVal, side === 'BUY' ? qty : -qty))) {
    //   logger.info(`Max position check failed for ${symbol}`);
    //   return res
    //     .status(403)
    //     .json({ error: 'Max position limit would be exceeded', decisionId: decisionDoc._id });
    // }

    const orderResult = await placeOrder({
      symbol,
      side,
      quantity: qty,
      price: priceVal,
      meta: { dryRun },
    });

    const orderDoc = await Order.create({
      orderId: orderResult.orderId,
      symbol,
      side,
      quantity: qty,
      price: priceVal,
      status: orderResult.status,
      decisionRef: decisionDoc._id,
      raw: orderResult.raw,
      createdAt: orderResult.placedAt,
      filledAt: orderResult.filledAt,
    });

    // --- 4) Update position based on the order (as before) ---
    let pos = await Position.findOne({ symbol }).exec();
    if (!pos) {
      pos = await Position.create({
        symbol,
        qty: side === 'BUY' ? qty : -qty,
        avgPrice: priceVal,
        updatedAt: new Date(),
      });
    } else {
      const newQty = pos.qty + (side === 'BUY' ? qty : -qty);
      let newAvg = pos.avgPrice;
      if (side === 'BUY' && newQty !== 0) {
        newAvg = ((pos.qty * pos.avgPrice) + (qty * priceVal)) / (pos.qty + qty);
      }
      pos.qty = newQty;
      pos.avgPrice = newAvg;
      pos.updatedAt = new Date();
      await pos.save();
    }

    io.emit('order', { order: orderDoc });

    return res.json({
      result: 'ORDER_PLACED',
      order: orderDoc,
      decisionId: decisionDoc._id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error', message: err.message });
  }
});
export default router;
