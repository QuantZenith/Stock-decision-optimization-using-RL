import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <nav className={`hidden md:flex flex-col h-full border-r border-landing-primary/10 bg-white dark:bg-[#211A1A] shrink-0 z-30 transition-all duration-300 shadow-xl relative ${
      isCollapsed ? 'w-24' : 'w-72'
    }`}>
      
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-20 h-8 w-8 bg-gradient-to-r from-landing-primary to-landing-primary-dark text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isCollapsed ? 'navigate_next' : 'navigate_before'}
        </span>
      </button>

      {/* Header / Logo Area */}
      <div className={`flex items-center gap-4 mb-8 px-4 py-5 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="relative shrink-0">
          {/* Replaced Image with Theme Logo */}
          <div className="flex items-center justify-center rounded-full size-14 bg-gradient-to-br from-landing-primary to-landing-primary-dark text-white font-bold text-2xl shadow-lg shadow-landing-primary/20">
            N
          </div>
          {/* Online Status Indicator */}
          <span className="absolute 0 -right-1 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#211A1A]"></span>
        </div>
        
        <div className={`flex flex-col ${isCollapsed ? 'hidden' : 'flex'}`}>
          <h1 className="text-lg font-display font-bold leading-tight text-landing-text dark:text-white">
            Nifty 50 <span className="text-landing-primary">Trader</span>
          </h1>
          <p className="text-landing-muted text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            AI Powered
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-3 flex-1 px-3">
        {/* Active Link (Dashboard) */}
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-landing-primary to-landing-primary-dark text-white shadow-lg shadow-landing-primary/20 group transition-all transform hover:scale-[1.02] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Dashboard' : ''}
        >
          <span className="material-symbols-outlined icon-filled text-[24px] shrink-0">dashboard</span>
          <p className={`text-base font-semibold tracking-wide transition-all ${isCollapsed ? 'hidden' : 'block'}`}>Dashboard</p>
        </Link>

        {/* Other Links */}
        {['Portfolio', 'Analytics', 'Orders', 'Settings'].map((item, i) => (
           <Link 
             key={i} 
             to="#" 
             className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-landing-primary/5 dark:hover:bg-white/5 group transition-all text-landing-muted hover:text-landing-primary dark:hover:text-white ${
               item === 'Settings' ? 'mt-auto' : ''
             } ${isCollapsed ? 'justify-center' : ''}`}
             title={isCollapsed ? item : ''}
           >
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform shrink-0">
                {item === 'Analytics' ? 'monitoring' : item === 'Orders' ? 'description' : item === 'Settings' ? 'settings' : 'pie_chart'}
              </span>
              <p className={`text-base font-semibold transition-all ${isCollapsed ? 'hidden' : 'block'}`}>{item}</p>
           </Link>
        ))}
      </div>
      
      {/* Footer / Status */}
      <div className={`mt-8 pt-6 border-t border-landing-primary/10 px-4 pb-4 transition-all ${
        isCollapsed ? 'hidden' : 'flex items-center gap-3'
      }`}>
          <div className="size-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0"></div>
          <p className="text-xs font-medium text-landing-muted font-mono">System Online</p>
      </div>
    </nav>
  );
};

export default Sidebar;