import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  PositionsTable,
  AISignals,
  QuickTradeForm
} from '../components/DashboardWidgets';

const Dashboard = () => {
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marketOpen, setMarketOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchMarketStatus = async () => {
    try {
      const { default: axiosInstance } = await import('../api/axiosInstance.js');
      const response = await axiosInstance.get('/api/market/status');
      if (response.data?.success) {
        setMarketOpen(response.data.marketOpen);
      }
    } catch (error) {
      console.error('Error fetching market status:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Dynamically import to avoid initialization errors
      const { default: axiosInstance } = await import('../api/axiosInstance.js');
      
      // Fetch positions
      const positionsRes = await axiosInstance.get('/trading/positions');
      if (positionsRes.data.success) {
        setPositions(positionsRes.data.positions);
      }

      // Fetch orders
      const ordersRes = await axiosInstance.get('/trading/orders?limit=20');
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
      }

      // Fetch portfolio stats
      const portfolioRes = await axiosInstance.get('/trading/portfolio');
      if (portfolioRes.data.success) {
        setPortfolio(portfolioRes.data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitTrade = async (data) => {
    try {
      const { default: axiosInstance } = await import('../api/axiosInstance.js');
      const response = await axiosInstance.post('/trading/orders', data);
      
      if (response.data.success) {
        // Refresh data after successful trade
        fetchUserData();
      }
    } catch (error) {
      console.error('Error submitting trade:', error);
      alert(error.response?.data?.message || 'Failed to submit trade');
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchMarketStatus();
    
    // Poll market status every 60 seconds
    const statusInterval = setInterval(fetchMarketStatus, 60000);
    
    return () => clearInterval(statusInterval);
  }, []);

  return (
    // Updated background to match Login/Landing theme
    <div className="bg-[#FDF9F9] dark:bg-[#161212] text-[#453030] dark:text-[#E8E0E0] font-body overflow-hidden h-screen w-full flex transition-all duration-300">
      
      {/* Sidebar Wrapper - Now manages collapse state */}
      <div className="z-20 h-full transition-all duration-300">
        <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">{/* Updated background to match Login/Landing theme */}
        
        {/* Decorative Background Blobs */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-landing-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-landing-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* New Header Matching Landing Page Theme */}
        <header className="px-8 py-6 z-10 flex justify-between items-center backdrop-blur-sm sticky top-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-display font-bold text-landing-text dark:text-white tracking-tight">
              Trading Dashboard
            </h1>
            <p className="text-sm text-landing-muted">Real-time Nifty 50 AI Analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#211A1A] border border-landing-primary/10 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${marketOpen ? 'bg-green-500' : 'bg-red-500'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${marketOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-xs font-bold text-landing-text dark:text-white">{marketOpen ? 'Market Open' : 'Market Closed'}</span>
             </div>
             
             {/* User Avatar Placeholder */}
             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-landing-primary to-landing-primary-dark text-white flex items-center justify-center font-bold shadow-lg shadow-landing-primary/20">
               NT
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative z-10 transition-all duration-300">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-landing-primary mx-auto mb-4"></div>
                <p className="text-landing-muted">Loading your portfolio...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Portfolio Stats Cards */}
              {portfolio && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
                  <div className="bg-white dark:bg-[#211A1A] rounded-2xl p-5 border border-landing-primary/10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-landing-muted mb-1">Portfolio Value</p>
                    <p className="text-2xl font-display font-bold text-landing-text dark:text-white">
                      ₹{portfolio.portfolioValue?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#211A1A] rounded-2xl p-5 border border-landing-primary/10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-landing-muted mb-1">Cash Balance</p>
                    <p className="text-2xl font-display font-bold text-landing-text dark:text-white">
                      ₹{portfolio.cash?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#211A1A] rounded-2xl p-5 border border-landing-primary/10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-landing-muted mb-1">Total P&L</p>
                    <p className={`text-2xl font-display font-bold ${portfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.totalPnL >= 0 ? '+' : ''}₹{portfolio.totalPnL?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#211A1A] rounded-2xl p-5 border border-landing-primary/10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-landing-muted mb-1">Returns</p>
                    <p className={`text-2xl font-display font-bold ${portfolio.totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.totalPnLPercent >= 0 ? '+' : ''}{portfolio.totalPnLPercent?.toFixed(2) || '0'}%
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1920px] mx-auto">

                {/* LEFT COLUMN - Charts & Signals */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
                  <div className="animate-fade-in-up delay-100">
                    <AISignals />
                  </div>
                  <div className="animate-fade-in-up delay-200">
                    <PositionsTable positions={positions} orders={orders} />
                  </div>
                </div>

                {/* RIGHT COLUMN - Quick Trade */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                  <div className="animate-fade-in-up delay-300">
                    <QuickTradeForm onSubmit={onSubmitTrade} portfolio={portfolio} marketOpen={marketOpen} />
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;