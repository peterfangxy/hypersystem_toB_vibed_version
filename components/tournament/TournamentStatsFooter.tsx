import React from 'react';
import { Trophy, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TournamentStatsFooterProps {
  totalPrizePool: number;
  totalFees: number;
  totalChipsInPlay: number;
  totalChipsCounted: number;
  chipDifference: number;
  isChipsBalanced: boolean;
  isInProgress: boolean;
  isProcessing: boolean;
  onComplete: () => void;
}

const TournamentStatsFooter: React.FC<TournamentStatsFooterProps> = ({
  totalPrizePool,
  totalFees,
  totalChipsInPlay,
  totalChipsCounted,
  chipDifference,
  isChipsBalanced,
  isInProgress,
  isProcessing,
  onComplete
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#151515] border-t border-[#333] p-4 flex flex-wrap gap-4 items-center justify-between rounded-b-3xl">
      <div className="flex flex-wrap gap-4 flex-1">
          
          {/* Financials Group */}
          <div className="flex items-center gap-3 pr-4 border-r border-[#333]">
              <div className="bg-[#222] px-3 py-2 rounded-lg border border-[#333]">
                  <span className="text-brand-green block text-[10px] font-bold uppercase mb-0.5">{t('tournaments.detail.prizePool')}</span>
                  <span className="text-white font-mono font-medium text-sm">${totalPrizePool.toLocaleString()}</span>
              </div>
              <div className="bg-[#222] px-3 py-2 rounded-lg border border-[#333]">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">{t('tournaments.detail.houseFees')}</span>
                  <span className="text-gray-300 font-mono font-medium text-sm">${totalFees.toLocaleString()}</span>
              </div>
          </div>

          {/* Chips Group */}
          <div className="flex items-center gap-3">
              <div className="bg-[#222] px-3 py-2 rounded-lg border border-[#333]">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">{t('tournaments.detail.chipsInPlay')}</span>
                  <span className="text-white font-mono font-medium text-sm">{totalChipsInPlay.toLocaleString()}</span>
              </div>
              <div className="bg-[#222] px-3 py-2 rounded-lg border border-[#333]">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">{t('tournaments.detail.chipsCounted')}</span>
                   <span className={`font-mono font-medium text-sm ${isChipsBalanced ? 'text-brand-green' : 'text-red-400'}`}>
                      {totalChipsCounted.toLocaleString()}
                  </span>
              </div>
              {chipDifference !== 0 && (
                   <div className="flex items-center gap-3 text-red-400 bg-red-950/20 px-3 py-2 rounded-lg border border-red-500/20">
                      <AlertTriangle size={16} />
                      <div>
                          <span className="block text-[10px] font-bold uppercase opacity-80">{t('tournaments.detail.discrepancy')}</span>
                          <span className="font-mono font-bold text-sm">
                              {chipDifference > 0 ? '-' : '+'}{Math.abs(chipDifference).toLocaleString()}
                          </span>
                      </div>
                  </div>
              )}
          </div>
      </div>
      
      {isInProgress && (
          <button 
              onClick={onComplete}
              disabled={!isChipsBalanced || isProcessing}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-xs shrink-0 ${
                  !isChipsBalanced || isProcessing
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-[#333]'
                  : 'bg-brand-green text-black hover:bg-brand-green/90 shadow-green-500/20 hover:scale-105'
              }`}
          >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
              {t('tournaments.detail.complete')}
          </button>
      )}
    </div>
  );
};

export default TournamentStatsFooter;
