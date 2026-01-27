
import { ClockConfig } from '../../types';
import { SEED_CLOCKS } from '../mockData';
import { broadcast } from '../broadcastService';
import { getLocalData, setLocalData, CLOCKS_KEY } from './storage';

export const getClockConfigs = (): ClockConfig[] => {
    const data = getLocalData<ClockConfig[]>(CLOCKS_KEY);
    if (!data) {
        setLocalData(CLOCKS_KEY, SEED_CLOCKS);
        return SEED_CLOCKS;
    }
    return data;
};

export const saveClockConfig = (config: ClockConfig): void => {
    const configs = getClockConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    if (index >= 0) {
        configs[index] = config;
    } else {
        configs.push(config);
    }
    setLocalData(CLOCKS_KEY, configs);
    broadcast('CLOCK_CONFIG_UPDATED', { clockId: config.id });
};

export const deleteClockConfig = (id: string): void => {
    const configs = getClockConfigs().filter(c => c.id !== id);
    setLocalData(CLOCKS_KEY, configs);
    broadcast('CLOCK_CONFIG_UPDATED', { clockId: id });
};
