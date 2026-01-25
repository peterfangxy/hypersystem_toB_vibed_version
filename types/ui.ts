
export type ClockFieldType = 
  | 'tournament_name' 
  | 'tournament_desc'
  | 'timer' 
  | 'blind_countdown'
  | 'blind_level' 
  | 'next_blinds'
  | 'ante' 
  | 'next_ante'
  | 'players_count' 
  | 'entries_count'
  | 'total_chips' 
  | 'avg_stack' 
  | 'starting_chips'
  | 'rebuy_limit'
  | 'next_break'
  | 'payout_total'
  | 'custom_text'
  | 'current_time'
  | 'current_date'
  | 'start_time'
  | 'start_date'
  | 'est_end_time'
  // Shapes & Lines
  | 'line'
  | 'shape_rect'
  | 'shape_circle'
  | 'shape_triangle'
  | 'image';

export interface ClockField {
    id: string;
    type: ClockFieldType;
    label: string; // For the editor list
    customText?: string; // If type is custom_text
    imageUrl?: string; // If type is image
    isTicker?: boolean; // If true, animate text scroll
    
    // Position & Style
    x: number; // Percent 0-100
    y: number; // Percent 0-100
    width?: number; // px for shapes/lines/images
    height?: number; // px for shapes/lines/images
    
    fontSize: number; // px (or simplified scale)
    fontWeight: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    color: string; // Fill Color for shapes, Font color for text
    
    // Border / Stroke for Shapes
    borderColor?: string;
    borderWidth?: number;

    align: 'left' | 'center' | 'right';
    
    showLabel: boolean; // Show "BLINDS:" prefix?
    labelText?: string; // "BLINDS"
}

export interface ClockConfig {
    id: string;
    name: string;
    description?: string; // New field for notes
    backgroundColor: string;
    fontColor?: string; // Global default font color
    backgroundImageUrl?: string;
    fields: ClockField[];
    isDefault?: boolean;
}

export type ViewState = 'dashboard' | 'members' | 'tables' | 'tournaments' | 'structures' | 'settings' | 'clocks';

export interface ClubTheme {
    primaryColor: string; // brand-green
    backgroundColor: string; // brand-black
    cardColor: string; // brand-dark
    textColor: string; // brand-white (Primary Font Color)
    secondaryTextColor: string; // brand-gray (Secondary Font Color)
    borderColor: string; // brand-border
}
