import type { SiteType } from '../types/database';

export interface PresetSite {
  name: string;
  type: SiteType;
  currency: string;
}

export const PRESET_SITES: PresetSite[] = [
  // Online
  { name: 'PokerStars', type: 'online', currency: 'USD' },
  { name: 'GGPoker', type: 'online', currency: 'USD' },
  { name: 'WPT Global', type: 'online', currency: 'USD' },
  { name: 'partypoker', type: 'online', currency: 'USD' },
  { name: '888poker', type: 'online', currency: 'USD' },
  { name: 'ACR (Americas Cardroom)', type: 'online', currency: 'USD' },
  { name: 'BetOnline', type: 'online', currency: 'USD' },
  { name: 'Ignition', type: 'online', currency: 'USD' },
  { name: 'Bovada', type: 'online', currency: 'USD' },
  { name: 'ClubGG', type: 'online', currency: 'USD' },
  { name: 'Winamax', type: 'online', currency: 'EUR' },
  { name: 'iPoker Network', type: 'online', currency: 'EUR' },
  // Live
  { name: 'Local Casino', type: 'live', currency: 'USD' },
  { name: 'Home Game', type: 'live', currency: 'USD' },
  { name: 'Bellagio', type: 'live', currency: 'USD' },
  { name: 'Aria', type: 'live', currency: 'USD' },
  { name: 'Wynn', type: 'live', currency: 'USD' },
  { name: 'Commerce Casino', type: 'live', currency: 'USD' },
  { name: 'Hustler Casino', type: 'live', currency: 'USD' },
];
