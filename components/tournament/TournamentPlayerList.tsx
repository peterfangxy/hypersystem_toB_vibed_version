
import React from 'react';
import { 
  Trophy, 
  PlayCircle, 
  Trash2, 
  Coins,
  CheckCircle2,
  PenTool
} from 'lucide-react';
import { RegistrationStatus, PokerTable } from '../../types';
import { EnrichedRegistration } from '../BuyinMgmtModal';
import { useLanguage } from '../../contexts/LanguageContext';
import NumberInput from '../ui/NumberInput';
import StatusBadge, { StatusVariant } from '../ui/StatusBadge';

interface TournamentPlayerListProps {
  registrations: EnrichedRegistration[];
  tables: PokerTable[];
  occupiedSeatsByTable: Map<string, Set<number>>;
  startingChips: number;
  isLocked: boolean;
  searchQuery: string;
  onSeatChange: (regId: string, tableId: string, seatNumber: number) => void;
  onStatusChange: (regId: string, status: RegistrationStatus) => void;
  onChipChange: (regId: string, chips: number) => void;
  onSign?: (regId: string) => void;
  onPaymentClick: (reg: EnrichedRegistration) => void;
  onDelete: (regId: string) => void;
}

const TournamentPlayerList: React.FC<TournamentPlayerListProps> = ({
  registrations,
  tables,
  occupiedSeatsByTable,
  startingChips,
  isLocked,
  searchQuery,
  onSeatChange,
  onStatusChange,
  onChipChange,
  onSign,
  onPaymentClick,
  onDelete
}) => {
  const { t } = useLanguage();

  const getStatusVariant = (status: RegistrationStatus): StatusVariant => {
    switch (status) {
      case 'Reserved': return 'info';
      case 'Joined': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
            <thead className="bg-[#151515] text-[10px] uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 w-[25%]">{t('tournaments.detail.table.player')}</th>
                <th className="px-6 py-3 w-[10%]">{t('tournaments.detail.table.status')}</th>
                <th className="px-6 py-3 w-[15%]">{t('tournaments.detail.table.seat')}</th>
                <th className="px-6 py-3 text-center w-[10%]">{t('tournaments.detail.table.entries')}</th>
                <th className="px-6 py-3 text-right w-[10%]">{t('tournaments.detail.table.chipsIn')}</th>
                <th className="px-6 py-3 text-right w-[15%]">{t('tournaments.detail.table.chipsOut')}</th>
                {isLocked && (
                     <th className="px-6 py-3 text-right text-brand-green w-[10%]">{t('tournaments.detail.table.winnings')}</th>
                )}
                <th className="px-6 py-3 text-right w-[5%]">{t('tournaments.detail.table.manage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-600 text-sm">
                    {searchQuery ? t('common.noData') : t('common.noData')}
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="group hover:bg-[#1A1A1A] transition-colors">
                    {/* Player Column */}
                    <td className="px-6 py-3 pr-2">
                      <div className="flex items-center gap-3">
                        {isLocked && reg.rank && (
                            <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold mr-1 ${
                                reg.rank === 1 ? 'bg-yellow-500 text-black' : 
                                reg.rank === 2 ? 'bg-gray-400 text-black' :
                                reg.rank === 3 ? 'bg-amber-700 text-white' : 'bg-[#333] text-gray-500'
                            }`}>
                                {reg.rank}
                            </div>
                        )}
                        <img 
                          src={reg.member?.avatarUrl} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover bg-gray-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-sm truncate">{reg.member?.fullName || 'Unknown'}</div>
                          <div className="text-[10px] text-gray-500">{reg.member?.club_id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-3">
                      <StatusBadge 
                        variant={getStatusVariant(reg.status)}
                        className="w-24"
                      >
                        {reg.status}
                      </StatusBadge>
                    </td>

                    {/* Table / Seat Column */}
                    <td className="px-6 py-3">
                        {(reg.status === 'Joined') ? (
                            <div className="flex items-center gap-2">
                                <select 
                                    value={reg.tableId || ''}
                                    onChange={(e) => onSeatChange(reg.id, e.target.value, reg.seatNumber || 1)}
                                    className="bg-[#222] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-brand-green w-full min-w-0"
                                    disabled={isLocked}
                                >
                                    <option value="" disabled>Table</option>
                                    {tables.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                
                                <select 
                                    value={reg.seatNumber || ''}
                                    onChange={(e) => onSeatChange(reg.id, reg.tableId || '', parseInt(e.target.value))}
                                    className="bg-[#222] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-brand-green w-[50px] shrink-0"
                                    disabled={!reg.tableId || isLocked}
                                >
                                    <option value="" disabled>Seat</option>
                                    {reg.assignedTable && Array.from({ length: reg.assignedTable.capacity }, (_, i) => i + 1).map(num => {
                                        const isTaken = occupiedSeatsByTable.get(reg.tableId!)?.has(num) && reg.seatNumber !== num;
                                        return (
                                            <option key={num} value={num} disabled={isTaken}>
                                                {num} {isTaken ? '(x)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        ) : (
                            <span className="text-gray-600 text-xs italic">
                                {reg.status === 'Reserved' ? 'On Waitlist' : '---'}
                            </span>
                        )}
                    </td>

                    {/* Entries Column */}
                    <td className="px-6 py-3 text-center">
                        <span className={`font-mono font-bold text-sm ${reg.buyInCount > 0 ? 'text-white' : 'text-gray-600'}`}>
                            {reg.buyInCount}
                        </span>
                    </td>

                    {/* Chips In Column */}
                    <td className="px-6 py-3 text-right">
                        <span className="text-gray-400 font-mono text-sm">{(reg.buyInCount * startingChips).toLocaleString()}</span>
                    </td>

                    {/* Chips Out Column */}
                    <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {reg.isSigned && (
                                <div title="Signed by Member">
                                    <CheckCircle2 size={16} className="text-brand-green animate-in zoom-in duration-200" />
                                </div>
                            )}
                            <NumberInput 
                                value={reg.finalChipCount}
                                onChange={(val) => onChipChange(reg.id, val || 0)}
                                min={0}
                                disabled={isLocked}
                                size="sm"
                                align="right"
                                className={`w-32 ${isLocked ? 'opacity-50' : ''}`}
                                variant="bordered"
                                enableScroll={false}
                                allowEmpty={true}
                                placeholder="0"
                            />
                        </div>
                     </td>

                    {/* Winnings Column */}
                    {isLocked && (
                        <td className="px-6 py-3 text-right">
                            {reg.prize && reg.prize > 0 ? (
                                <span className="font-bold text-brand-green flex items-center justify-end gap-1 text-sm">
                                    <Trophy size={12} />
                                    ${reg.prize.toLocaleString()}
                                </span>
                            ) : (
                                <span className="text-gray-700 text-sm">-</span>
                            )}
                        </td>
                    )}

                    {/* Actions Column */}
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {/* Payment Button */}
                        <button 
                            onClick={() => onPaymentClick(reg)}
                            className={`p-1.5 rounded-lg transition-colors ${
                                reg.buyInCount === 0 
                                ? 'bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-black animate-pulse'
                                : 'text-gray-500 hover:text-white hover:bg-[#333]'
                            }`}
                            title="Payments"
                        >
                            <Coins size={16} />
                        </button>

                        {!isLocked && (
                            <>
                                {reg.status === 'Joined' && !reg.isSigned && onSign && (
                                    <button 
                                        onClick={() => onSign(reg.id)}
                                        className="p-1.5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors"
                                        title="Member E-Sign"
                                    >
                                        <PenTool size={16} />
                                    </button>
                                )}

                                {reg.status === 'Reserved' && (
                                <button 
                                    onClick={() => onStatusChange(reg.id, 'Joined')}
                                    className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                                    title="Seat Player"
                                >
                                    <PlayCircle size={16} />
                                </button>
                                )}
                                <button 
                                    onClick={() => onDelete(reg.id)}
                                    className="p-1.5 text-gray-600 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                    title={t('common.delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
    </div>
  );
};

export default TournamentPlayerList;
