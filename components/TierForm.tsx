
import React, { useState, useEffect } from 'react';
import { TierDefinition } from '../types';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import Button from './ui/Button';
import { Palette, Crown, ScrollText, CheckCircle2 } from 'lucide-react';

interface TierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tier: TierDefinition) => void;
  initialData?: TierDefinition;
  isNew?: boolean;
}

const TierForm: React.FC<TierFormProps> = ({ isOpen, onClose, onSubmit, initialData, isNew = false }) => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<TierDefinition>>({
    name: '',
    color: '#06C167',
    requirements: '',
    benefits: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          color: '#06C167',
          requirements: '',
          benefits: ''
        });
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTier: TierDefinition = {
      id: initialData?.id || crypto.randomUUID(),
      order: initialData?.order || 99,
      ...formData as TierDefinition
    };
    onSubmit(newTier);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? "New Tier" : `Edit Tier: ${initialData?.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Preview Header */}
        <div className="flex items-center justify-start p-6 bg-[#1A1A1A] rounded-xl border border-[#333] mb-6 relative overflow-hidden h-32">
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ backgroundColor: formData.color }}
            />
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 p-10 opacity-5 pointer-events-none">
                 <Crown size={120} style={{ color: formData.color }} />
            </div>

            <div className="flex items-center gap-4 relative z-10 pl-2">
                <div className="w-14 h-14 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/5 shadow-lg">
                    <Crown size={28} style={{ color: formData.color }} fill="currentColor" className="opacity-90" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-white tracking-widest uppercase shadow-black drop-shadow-md">{formData.name || 'TIER NAME'}</h3>
                    <span className="text-[10px] font-bold text-white/50 bg-black/30 px-2 py-1 rounded border border-white/10 uppercase tracking-wider">Membership Card</span>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-1">
                    <label className="text-sm font-medium text-gray-300">Display Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none`}
                        placeholder="e.g. Diamond Elite"
                    />
                </div>
                <div className="col-span-1 space-y-1">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-1"><Palette size={14}/> Color</label>
                    <div className="flex items-center gap-2 h-[46px] bg-[#1A1A1A] rounded-xl border border-[#333] px-2">
                        <input 
                            type="color" 
                            value={formData.color}
                            onChange={e => setFormData({...formData, color: e.target.value})}
                            className="w-full h-8 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Requirements</label>
                <input 
                    type="text" 
                    value={formData.requirements}
                    onChange={e => setFormData({...formData, requirements: e.target.value})}
                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none placeholder:text-gray-600`}
                    placeholder="e.g. 5,000 Points per year"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><ScrollText size={14} className="text-brand-green"/> Tier Benefits (Staff Notes)</label>
                <textarea 
                    rows={6}
                    value={formData.benefits}
                    onChange={e => setFormData({...formData, benefits: e.target.value})}
                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none resize-none leading-relaxed`}
                    placeholder="- Free entry to weekly tournament&#10;- Priority waitlist access&#10;- 20% discount on F&B"
                />
            </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth
            size="lg"
          >
            Save Tier
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TierForm;
