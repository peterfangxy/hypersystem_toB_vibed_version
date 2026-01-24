
import React, { forwardRef } from 'react';
import { ClockConfig, ClockField } from '../../types';

interface ClockCanvasProps {
  config: ClockConfig;
  selectedFieldId: string | null;
  showGrid: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onBackgroundClick: () => void;
}

const MOCK_PREVIEW_DATA: Record<string, string> = {
    tournament_name: "Sunday Special",
    tournament_desc: "$10k Guaranteed",
    timer: "18:42",
    blind_countdown: "18:42",
    blind_level: "1,000 / 2,000",
    next_blinds: "1,500 / 3,000",
    ante: "2,000",
    next_ante: "3,000",
    starting_chips: "25,000",
    rebuy_limit: "1 Rebuy",
    players_count: "45 / 120",
    entries_count: "142",
    total_chips: "3,550,000",
    avg_stack: "78,888",
    payout_total: "$12,500",
    next_break: "1h 15m",
    current_time: "08:30 PM",
    current_date: new Date().toLocaleDateString(),
    start_time: "06:00 PM",
    start_date: new Date().toLocaleDateString(),
    est_end_time: "01:30 AM",
};

const ClockCanvas = forwardRef<HTMLDivElement, ClockCanvasProps>(({
  config,
  selectedFieldId,
  showGrid,
  onMouseDown,
  onBackgroundClick
}, ref) => {

  const renderWidgetContent = (field: ClockField) => {
      if (field.type === 'shape_rect') {
          return (
              <div style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  backgroundColor: field.color,
                  borderWidth: `${field.borderWidth || 0}px`,
                  borderColor: field.borderColor,
                  borderStyle: 'solid'
              }} />
          );
      }
      if (field.type === 'shape_circle') {
          return (
              <div style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  backgroundColor: field.color,
                  borderRadius: '50%',
                  borderWidth: `${field.borderWidth || 0}px`,
                  borderColor: field.borderColor,
                  borderStyle: 'solid'
              }} />
          );
      }
      if (field.type === 'shape_triangle') {
          return (
              <svg width={field.width} height={field.height} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="50,0 100,100 0,100" fill={field.color} stroke={field.borderColor} strokeWidth={field.borderWidth ? (field.borderWidth * (100 / (field.width || 100))) : 0} />
              </svg>
          );
      }
      if (field.type === 'line') {
          return (
              <div style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  backgroundColor: field.color,
                  borderRadius: '999px'
              }} />
          );
      }
      
      const textValue = field.type === 'custom_text' 
        ? (field.customText || 'Custom Text') 
        : (MOCK_PREVIEW_DATA[field.type] || field.type);

      return (
        <div style={{
            fontSize: `${field.fontSize}px`,
            fontWeight: field.fontWeight,
            fontStyle: field.fontStyle || 'normal',
            textDecoration: field.textDecoration || 'none',
            color: field.color,
            textAlign: field.align,
            whiteSpace: 'nowrap'
        }}>
            {field.showLabel && field.labelText && <div className="text-[0.4em] opacity-70 tracking-widest mb-[0.1em]" style={{ fontStyle: 'normal', textDecoration: 'none' }}>{field.labelText}</div>}
            {textValue}
        </div>
      );
  };

  return (
    <div 
        ref={ref}
        className="aspect-video w-full max-w-6xl shadow-2xl relative border border-[#333] overflow-hidden"
        style={{ backgroundColor: config.backgroundColor, backgroundImage: showGrid ? 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)' : 'none', backgroundSize: '5% 5%' }}
        onClick={onBackgroundClick}
    >
        {config.fields.map(field => (
            <div
                key={field.id}
                onMouseDown={(e) => onMouseDown(e, field.id)}
                onClick={(e) => e.stopPropagation()}
                className={`absolute cursor-move hover:outline hover:outline-1 hover:outline-brand-green/50 ${selectedFieldId === field.id ? 'outline outline-2 outline-brand-green z-10' : ''}`}
                style={{ left: `${field.x}%`, top: `${field.y}%`, transform: 'translate(-50%, -50%)', zIndex: config.fields.findIndex(f => f.id === field.id) }}
            >
                {renderWidgetContent(field)}
            </div>
        ))}
    </div>
  );
});

export default ClockCanvas;
