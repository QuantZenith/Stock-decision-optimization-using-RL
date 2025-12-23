import { useDispatch, useSelector } from 'react-redux';
import { clearCandles, addTick, setCandles } from './chartSlice';
import { clearSignals, addSignal } from './signalsSlice';

/**
 * Custom hook for Redux state management and common operations
 */
export const useAppState = () => {
  const dispatch = useDispatch();
  
  const candles = useSelector((state) => state.chart.candles);
  const currentPrice = useSelector((state) => state.chart.currentPrice);
  const chartLastUpdated = useSelector((state) => state.chart.lastUpdated);
  
  const signals = useSelector((state) => state.signals.signals);
  const totalSignals = useSelector((state) => state.signals.totalSignals);
  const signalsLastUpdated = useSelector((state) => state.signals.lastUpdated);

  return {
    // Chart data
    candles,
    currentPrice,
    chartLastUpdated,
    
    // Signals data
    signals,
    totalSignals,
    signalsLastUpdated,
    
    // Chart actions
    addTick: (payload) => dispatch(addTick(payload)),
    setCandles: (payload) => dispatch(setCandles(payload)),
    clearChartData: () => dispatch(clearCandles()),
    
    // Signal actions
    addSignal: (payload) => dispatch(addSignal(payload)),
    clearSignalData: () => dispatch(clearSignals()),
    
    // Combined actions
    clearAllData: () => {
      dispatch(clearCandles());
      dispatch(clearSignals());
      localStorage.removeItem('reduxState');
    },
  };
};

/**
 * Get storage usage info
 */
export const getStorageInfo = () => {
  try {
    const stored = localStorage.getItem('reduxState');
    const sizeInBytes = new Blob([stored]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return {
      size: sizeInKB,
      unit: 'KB',
      stored: !!stored,
    };
  } catch {
    return { size: 0, unit: 'KB', stored: false };
  }
};
