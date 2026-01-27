
import React from 'react';
import { Save, Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import { THEME } from '../../theme';
import { ClubSettings } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface GeneralSettingsProps {
    settings: ClubSettings;
    setSettings: React.Dispatch<React.SetStateAction<ClubSettings>>;
    onSave: (e?: React.FormEvent) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, setSettings, onSave }) => {
    const { t } = useLanguage();
    
    return (
      <form onSubmit={onSave} className={`${THEME.card} border ${THEME.border} rounded-3xl p-8 space-y-6 animate-in fade-in`}>
          <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-6">{t('settings.general.title')}</h3>
              
              <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">{t('settings.general.clubName')}</label>
                  <input 
                      type="text"
                      required
                      value={settings.name}
                      onChange={e => setSettings({...settings, name: e.target.value})}
                      className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">{t('settings.general.logoUrl')}</label>
                  <input 
                      type="url"
                      value={settings.logoUrl}
                      onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                      className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                      placeholder="https://..."
                  />
              </div>
          </div>

          <div className="pt-6 border-t border-[#222] space-y-4">
              <h3 className="text-lg font-bold text-white mb-6">{t('settings.general.contactTitle')}</h3>
              
              <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <MapPin size={14}/> {t('settings.general.address')}
                  </label>
                  <input 
                      type="text"
                      value={settings.address}
                      onChange={e => setSettings({...settings, address: e.target.value})}
                      className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <LinkIcon size={14}/> {t('settings.general.googleMaps')}
                  </label>
                  <input 
                      type="url"
                      value={settings.googleMapLink || ''}
                      onChange={e => setSettings({...settings, googleMapLink: e.target.value})}
                      className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                      placeholder="https://maps.app.goo.gl/..."
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <Mail size={14}/> {t('settings.general.email')}
                      </label>
                      <input 
                          type="email"
                          value={settings.contactEmail}
                          onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                          className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <Phone size={14}/> {t('settings.general.phone')}
                      </label>
                      <input 
                          type="tel"
                          value={settings.contactPhone}
                          onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                          className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                      />
                  </div>
              </div>
          </div>

          <div className="pt-6">
              <button type="submit" className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2`}>
                  <Save size={18} /> {t('settings.general.save')}
              </button>
          </div>
      </form>
    );
};

export default GeneralSettings;