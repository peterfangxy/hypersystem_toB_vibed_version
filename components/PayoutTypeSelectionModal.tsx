
import React from 'react';
import { Table as TableIcon, Calculator, Cpu } from 'lucide-react';
import { Modal } from './ui/Modal';
import { PayoutType } from '../types';

interface PayoutTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: PayoutType) => void;
}

const PayoutTypeSelectionModal: React.FC<PayoutTypeSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  
  const options: { type: PayoutType; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
      {
          type: 'Custom',
          title: 'Custom Matrix',
          desc: 'Define payout ranges manually. Best for standard tournaments with fixed percentage distributions.',
          icon: <TableIcon size={28} />,
          color: 'bg-brand-green/20 text-brand-green border-brand-green/30'
      },
      {
          type: 'ICM',
          title: 'ICM Calculator',
          desc: 'Independent Chip Model. Calculates equity based on chip stacks. Ideal for final tables.',
          icon: <Calculator size={28} />,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      },
      {
          type: 'ChipEV',
          title: 'Chip EV',
          desc: 'Direct equity calculation based on chip count percentages. Simple and transparent.',
          icon: <Cpu size={28} />,
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Payout Model Type"
      size="lg"
    >
      <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
              {options.map((opt) => (
                  <button
                      key={opt.type}
                      onClick={() => onSelect(opt.type)}
                      className={`flex flex-col items-center text-center p-6 rounded-2xl border transition-all hover:scale-105 active:scale-95 group ${opt.color} bg-opacity-10 border-opacity-30 hover:bg-opacity-20`}
                  >
                      <div className="mb-4 p-4 rounded-full bg-black/20 backdrop-blur-sm">
                          {opt.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{opt.title}</h3>
                      <p className="text-xs text-gray-300 leading-relaxed opacity-80 group-hover:opacity-100">
                          {opt.desc}
                      </p>
                  </button>
              ))}
          </div>
      </div>
    </Modal>
  );
};

export default PayoutTypeSelectionModal;
