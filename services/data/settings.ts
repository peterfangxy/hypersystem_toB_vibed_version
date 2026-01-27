
import { ClubSettings } from '../../types';
import { getLocalData, setLocalData, SETTINGS_KEY } from './storage';

export const getClubSettings = (): ClubSettings => {
  const defaults: ClubSettings = {
    name: 'Royal Flush Club',
    address: '123 Poker Blvd, Las Vegas, NV',
    googleMapLink: '',
    contactEmail: 'info@royalflush.com',
    contactPhone: '+1 (555) 123-4567',
    logoUrl: '',
    theme: {
      primaryColor: '#06C167',
      backgroundColor: '#000000',
      cardColor: '#171717',
      textColor: '#FFFFFF',
      secondaryTextColor: '#A3A3A3',
      borderColor: '#333333'
    }
  };
  return getLocalData<ClubSettings>(SETTINGS_KEY) || defaults;
};

export const saveClubSettings = (settings: ClubSettings): void => {
  setLocalData(SETTINGS_KEY, settings);
};
