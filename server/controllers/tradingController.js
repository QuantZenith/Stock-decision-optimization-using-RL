import Account from "../models/accountModel.js";
import Order from "../models/Order.js";
import Position from "../models/Position.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhander.js";

// @desc    Get user's paper trading account
// @route   GET /api/trading/account
// @access  Private
export const getAccount = catchAsyncErrors(async (req, res, next) => {
  const account = await Account.findOne({ userId: req.user.id });

  if (!account) {
    return next(new ErrorHandler("Account not found", 404));
  }

  const portfolioStats = account.calculatePortfolioValue();

  res.status(200).json({
    success: true,
    account: {
      ...account.toObject(),
      portfolioStats,
    },
  });
});

// @desc    Create a new order (Buy/Sell)
// @route   POST /api/trading/orders
// @access  Private
export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const { symbol, side, quantity, price, orderType = "MARKET" } = req.body;

  // Validate inputs
  if (!symbol || !side || !quantity || !price) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Get user's account
  const account = await Account.findOne({ userId: req.user.id });
  if (!account) {
    return next(new ErrorHandler("Account not found", 404));
  }

  const totalCost = quantity * price;

  // For BUY orders, check if user has enough balance
  if (side === "BUY") {
    if (account.balance < totalCost) {
      return next(
        new ErrorHandler(
          `Insufficient balance. Required: ₹${totalCost}, Available: ₹${account.balance}`,
          400
        )
      );
    }
  }

  // For SELL orders, check if user has enough quantity
  if (side === "SELL") {
    const holding = account.holdings.find((h) => h.symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      return next(
        new ErrorHandler(
          `Insufficient holdings. Required: ${quantity}, Available: ${holding?.quantity || 0}`,
          400
        )
      );
    }
  }

  // Generate unique order ID
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order
  const order = await Order.create({
    userId: req.user.id,
    orderId,
    symbol,
    side,
    quantity,
    price,
    orderType,
    status: "FILLED", // Auto-fill for paper trading
    filledAt: Date.now(),
  });

  // Update account and positions
  if (side === "BUY") {
    // Deduct cash
    account.balance -= totalCost;
    account.totalInvested += totalCost;

    // Update or create holding
    const holdingIndex = account.holdings.findIndex((h) => h.symbol === symbol);
    if (holdingIndex > -1) {
      const holding = account.holdings[holdingIndex];
      const newQty = holding.quantity + quantity;
      const newAvgPrice = (holding.quantity * holding.avgPrice + totalCost) / newQty;
      account.holdings[holdingIndex].quantity = newQty;
      account.holdings[holdingIndex].avgPrice = newAvgPrice;
      account.holdings[holdingIndex].currentPrice = price;
      account.holdings[holdingIndex].updatedAt = Date.now();
    } else {
      account.holdings.push({
        symbol,
        quantity,
        avgPrice: price,
        currentPrice: price,
        pnl: 0,
        pnlPercent: 0,
      });
    }

    // Update Position collection
    await Position.findOneAndUpdate(
      { userId: req.user.id, symbol },
      {
        $inc: { qty: quantity },
        $set: { updatedAt: Date.now() },
      },
      { upsert: true, new: true }
    ).then(async (position) => {
      // Recalculate avgPrice
      const orders = await Order.find({
        userId: req.user.id,
        symbol,
        side: "BUY",
        status: "FILLED",
      });
      const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
      const totalValue = orders.reduce((sum, o) => sum + o.quantity * o.price, 0);
      position.avgPrice = totalValue / totalQty;
      position.currentPrice = price;
      await position.save();
    });
  } else if (side === "SELL") {
    // Add cash
    account.balance += totalCost;

    // Update holding
    const holdingIndex = account.holdings.findIndex((h) => h.symbol === symbol);
    if (holdingIndex > -1) {
      account.holdings[holdingIndex].quantity -= quantity;
      account.holdings[holdingIndex].currentPrice = price;
      account.holdings[holdingIndex].updatedAt = Date.now();

      // Remove holding if quantity is 0
      if (account.holdings[holdingIndex].quantity === 0) {
        account.holdings.splice(holdingIndex, 1);
      }
    }

    // Update Position collection
    const position = await Position.findOne({ userId: req.user.id, symbol });
    if (position) {
      position.qty -= quantity;
      position.currentPrice = price;
      if (position.qty === 0) {
        await Position.deleteOne({ userId: req.user.id, symbol });
      } else {
        await position.save();
      }
    }
  }

  await account.save();

  res.status(201).json({
    success: true,
    message: `Order ${side === "BUY" ? "placed" : "executed"} successfully`,
    order,
    account: {
      balance: account.balance,
      portfolioStats: account.calculatePortfolioValue(),
    },
  });
});

// @desc    Get user's orders
// @route   GET /api/trading/orders
// @access  Private
export const getOrders = catchAsyncErrors(async (req, res, next) => {
  const { limit = 20, status } = req.query;

  const filter = { userId: req.user.id };
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// @desc    Get user's positions
// @route   GET /api/trading/positions
// @access  Private
export const getPositions = catchAsyncErrors(async (req, res, next) => {
  const positions = await Position.find({ userId: req.user.id, qty: { $gt: 0 } });

  res.status(200).json({
    success: true,
    count: positions.length,
    positions,
  });
});

// @desc    Get portfolio stats and holdings
// @route   GET /api/trading/portfolio
// @access  Private
export const getPortfolio = catchAsyncErrors(async (req, res, next) => {
  const account = await Account.findOne({ userId: req.user.id });

  if (!account) {
    return next(new ErrorHandler("Account not found", 404));
  }

  const portfolioStats = account.calculatePortfolioValue();
  const positions = await Position.find({ userId: req.user.id, qty: { $gt: 0 } });

  res.status(200).json({
    success: true,
    portfolio: {
      ...portfolioStats,
      holdings: account.holdings,
      positions,
    },
  });
});

// @desc    Reset paper trading account
// @route   POST /api/trading/account/reset
// @access  Private
export const resetAccount = catchAsyncErrors(async (req, res, next) => {
  const account = await Account.findOne({ userId: req.user.id });

  if (!account) {
    return next(new ErrorHandler("Account not found", 404));
  }

  // Reset account to initial state
  account.balance = account.initialBalance;
  account.totalInvested = 0;
  account.totalPnL = 0;
  account.holdings = [];
  await account.save();

  // Clear positions
  await Position.deleteMany({ userId: req.user.id });

  res.status(200).json({
    success: true,
    message: "Account reset successfully",
    account,
  });
});
