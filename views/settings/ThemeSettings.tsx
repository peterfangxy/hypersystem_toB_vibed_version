
import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { THEME } from '../../theme';
import { ClubSettings } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import StatusBadge from '../../components/ui/StatusBadge';

interface ThemeSettingsProps {
    settings: ClubSettings;
    onThemeChange: (key: keyof ClubSettings['theme'], value: string) => void;
    onReset: () => void;
    onSave: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ settings, onThemeChange, onReset, onSave }) => {
    const { t } = useLanguage();

    return (
      <div className={`${THEME.card} border ${THEME.border} rounded-3xl p-8 space-y-8 animate-in fade-in`}>
           <div className="flex justify-between items-start">
              <div>
                  <h3 className="text-lg font-bold text-white mb-2">{t('settings.appearance.title')}</h3>
                  <p className="text-gray-400 text-sm">{t('settings.appearance.subtitle')}</p>
              </div>
              <button 
                 onClick={onReset}
                 className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 bg-[#222] px-3 py-1.5 rounded-lg border border-[#333]"
              >
                  <RotateCcw size={12} /> {t('settings.appearance.reset')}
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Group 1: Brand Colors */}
              <div className="md:col-span-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#222] pb-2">{t('settings.appearance.brandColors')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 block">{t('settings.appearance.primaryAccent')}</label>
                          <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={settings.theme.primaryColor}
                                onChange={(e) => onThemeChange('primaryColor', e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                              />
                              <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 font-mono">{settings.theme.primaryColor}</span>
                                  <span className="text-[10px] text-gray-600">{t('settings.appearance.primaryAccentDesc')}</span>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 block">{t('settings.appearance.appBackground')}</label>
                          <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={settings.theme.backgroundColor}
                                onChange={(e) => onThemeChange('backgroundColor', e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                              />
                              <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 font-mono">{settings.theme.backgroundColor}</span>
                                  <span className="text-[10px] text-gray-600">{t('settings.appearance.appBackgroundDesc')}</span>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 block">{t('settings.appearance.cardSurface')}</label>
                          <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={settings.theme.cardColor}
                                onChange={(e) => onThemeChange('cardColor', e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                              />
                              <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 font-mono">{settings.theme.cardColor}</span>
                                  <span className="text-[10px] text-gray-600">{t('settings.appearance.cardSurfaceDesc')}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Group 2: Typography & Borders */}
              <div className="md:col-span-3 mt-4">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#222] pb-2">{t('settings.appearance.typography')}</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 block">{t('settings.appearance.primaryText')}</label>
                          <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={settings.theme.textColor || '#FFFFFF'}
                                onChange={(e) => onThemeChange('textColor', e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                              />
                              <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 font-mono">{settings.theme.textColor}</span>
                                  <span className="text-[10px] text-gray-600">{t('settings.appearance.primaryTextDesc')}</span>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 block">{t('settings.appearance.secondaryText')}</label>
                          <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={settings.theme.secondaryTextColor || '#A3A3A3'}
                                onChange={(e) => onThemeChange('secondaryTextColor', e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                              />
                              <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 font-mono">{settings.theme.secondaryTextColor}</span>
                                  <span className="text-[10px] text-gray-600">{t('settings.appearance.secondaryTextDesc')}</span>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-300 block">{t('settings.appearance.borderColor')}</label>
                          <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={settings.theme.borderColor || '#333333'}
                                onChange={(e) => onThemeChange('borderColor', e.target.value)}
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                              />
                              <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 font-mono">{settings.theme.borderColor}</span>
                                  <span className="text-[10px] text-gray-600">{t('settings.appearance.borderColorDesc')}</span>
                              </div>
                          </div>
                      </div>

                   </div>
              </div>
          </div>

          <div className="p-6 mt-8 bg-[#1A1A1A] rounded-2xl border border-brand-border">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('settings.appearance.previewTitle')}</h4>
              <div className="flex flex-wrap gap-4 items-center">
                  <button className={`${THEME.buttonPrimary} px-6 py-2 rounded-lg font-bold`}>
                      {t('settings.appearance.previewButton')}
                  </button>
                  <StatusBadge variant="success" dot>
                      {t('settings.appearance.previewBadge')}
                  </StatusBadge>
                  <div className="px-4 py-2 border border-brand-border rounded-lg text-brand-white">
                      {t('settings.appearance.previewBordered')}
                  </div>
                  <div className="text-sm text-brand-gray">
                      {t('settings.appearance.previewSecondary')}
                  </div>
              </div>
          </div>

          <div className="pt-4 flex justify-end">
               <button onClick={() => onSave()} className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2`}>
                  <Save size={18} /> {t('settings.appearance.save')}
              </button>
          </div>
      </div>
    );
};

export default ThemeSettings;
