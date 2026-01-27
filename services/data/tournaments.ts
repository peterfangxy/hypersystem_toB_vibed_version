
import { Tournament } from '../../types';
import { SEED_TOURNAMENTS, SEED_TEMPLATES } from '../mockData';
import { broadcast } from '../broadcastService';
import { getLocalData, setLocalData, TOURNAMENTS_KEY, TEMPLATES_KEY } from './storage';

// --- Tournaments ---
export const getTournaments = (): Tournament[] => {
  const data = getLocalData<Tournament[]>(TOURNAMENTS_KEY);
  if (!data || data.length === 0) {
      setLocalData(TOURNAMENTS_KEY, SEED_TOURNAMENTS);
      return SEED_TOURNAMENTS;
  }
  return data;
};

export const saveTournament = (tournament: Tournament): void => {
  const tournaments = getTournaments();
  const idx = tournaments.findIndex(t => t.id === tournament.id);
  if (idx >= 0) tournaments[idx] = tournament;
  else tournaments.push(tournament);
  setLocalData(TOURNAMENTS_KEY, tournaments);
  if (!tournament.isTemplate) {
      broadcast('TOURNAMENT_UPDATED', { tournamentId: tournament.id });
  }
};

// --- Templates ---
export const getTournamentTemplates = (): Tournament[] => {
  const data = getLocalData<Tournament[]>(TEMPLATES_KEY);
  if (!data || data.length === 0) {
      setLocalData(TEMPLATES_KEY, SEED_TEMPLATES);
      return SEED_TEMPLATES;
  }
  return data;
};

export const saveTournamentTemplate = (template: Tournament): void => {
    const templates = getTournamentTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    const safeTemplate = { ...template, isTemplate: true };
    if (idx >= 0) templates[idx] = safeTemplate;
    else templates.push(safeTemplate);
    setLocalData(TEMPLATES_KEY, templates);
};

export const deleteTournamentTemplate = (id: string): void => {
    const templates = getTournamentTemplates().filter(t => t.id !== id);
    setLocalData(TEMPLATES_KEY, templates);
};
