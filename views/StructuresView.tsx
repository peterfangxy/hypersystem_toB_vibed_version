
import React from 'react';
import { Layers, DollarSign } from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';
import BlindsStructureList from './structures/BlindsStructureList';
import PayoutModelsList from './structures/PayoutModelsList';

const StructuresView = () => {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader
        title={t('structures.title')}
        subtitle={t('structures.subtitle')}
      />

      {/* Tabs Navigation */}
      <TabContainer>
        <NavLink
          to="blinds"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Layers size={18} />
                        {t('structures.tabs.blinds')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="payouts"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} />
                        {t('structures.tabs.payouts')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative flex flex-col">
         <Routes>
             <Route path="blinds" element={<BlindsStructureList />} />
             <Route path="payouts" element={<PayoutModelsList />} />
             <Route index element={<Navigate to="blinds" replace />} />
         </Routes>
      </div>
    </div>
  );
};

export default StructuresView;
