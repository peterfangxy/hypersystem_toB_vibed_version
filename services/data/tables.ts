
import { PokerTable } from '../../types';
import { SEED_TABLES } from '../mockData';
import { broadcast } from '../broadcastService';
import { getLocalData, setLocalData, TABLES_KEY } from './storage';

export const getTables = (): PokerTable[] => {
  const data = getLocalData<PokerTable[]>(TABLES_KEY);
  if (!data || data.length === 0) {
      setLocalData(TABLES_KEY, SEED_TABLES);
      return SEED_TABLES;
  }
  return data;
};

export const saveTable = (table: PokerTable): void => {
  const tables = getTables();
  const idx = tables.findIndex(t => t.id === table.id);
  if (idx >= 0) tables[idx] = table;
  else tables.push(table);
  setLocalData(TABLES_KEY, tables);
  broadcast('TABLE_UPDATED', { tableId: table.id });
};

export const deleteTable = (id: string): void => {
  const tables = getTables().filter(t => t.id !== id);
  setLocalData(TABLES_KEY, tables);
  broadcast('TABLE_UPDATED', { tableId: id });
};

export const getNextTableName = (): string => {
  const tables = getTables();
  return `Table ${tables.length + 1}`;
};
