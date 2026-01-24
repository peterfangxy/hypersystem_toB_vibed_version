
import React from 'react';
import { ClockConfig, ClockField } from '../types';

interface ClockDisplayProps {
  config: ClockConfig;
  data: Record<string, string>; // Values for dynamic fields
  scale?: number; // Scaling factor (e.g. 0.5 for half size)
  baseWidth?: number; // Original design width (default 1280)
  baseHeight?: number; // Original design height (default 720)
  className?: string;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({
  config,
  data,
  scale = 1,
  baseWidth = 1280,
  baseHeight = 720,
  className = ''
}) => {
  
  const fields = config.fields || [];

  const renderField = (field: ClockField) => {
    // 1. Handle Shapes, Lines & Images (No text data needed)
    if (field.type === 'shape_rect') {
        return (
            <div style={{
                width: field.width, 
                height: field.height, 
                backgroundColor: field.color,
                border: `${field.borderWidth || 0}px solid ${field.borderColor || 'transparent'}`,
                borderRadius: '0'
            }}/>
        );
    }
    if (field.type === 'shape_circle') {
        return (
            <div style={{
                width: field.width, 
                height: field.height, 
                backgroundColor: field.color,
                border: `${field.borderWidth || 0}px solid ${field.borderColor || 'transparent'}`,
                borderRadius: '50%'
            }}/>
        );
    }
    if (field.type === 'shape_triangle') {
        return (
            <svg width={field.width} height={field.height} viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon 
                    points="50,0 100,100 0,100" 
                    fill={field.color} 
                    stroke={field.borderColor} 
                    strokeWidth={field.borderWidth ? (field.borderWidth * (100 / (field.width || 100))) : 0} 
                />
            </svg>
        );
    }
    if (field.type === 'line') {
        return (
            <div style={{
                width: field.width,
                height: field.height,
                backgroundColor: field.color,
                borderRadius: '999px'
            }} />
        );
    }
    if (field.type === 'image') {
        if (!field.imageUrl) return null;
        return (
            <img 
                src={field.imageUrl} 
                alt="Widget" 
                style={{
                    width: field.width,
                    height: field.height,
                    objectFit: 'contain',
                    border: field.borderWidth ? `${field.borderWidth}px solid ${field.borderColor || 'transparent'}` : 'none',
                }}
            />
        );
    }

    // 2. Handle Text Fields
    const textValue = field.type === 'custom_text' ? (field.customText || '') : (data[field.type] || '---');

    return (
        <div style={{
            color: field.color,
            fontSize: `${field.fontSize}px`,
            fontWeight: field.fontWeight,
            fontStyle: field.fontStyle || 'normal',
            textDecoration: field.textDecoration || 'none',
            textAlign: field.align,
            whiteSpace: 'nowrap',
            lineHeight: 1.2
        }}>
            {field.showLabel && field.labelText && (
                <div className="text-[0.4em] opacity-70 mb-[0.1em] tracking-widest uppercase font-bold" style={{ fontStyle: 'normal', textDecoration: 'none' }}>
                    {field.labelText}
                </div>
            )}
            {textValue}
        </div>
    );
  };

  return (
    <div 
        className={`relative overflow-hidden ${className}`}
        style={{ 
            width: `${baseWidth * scale}px`, 
            height: `${baseHeight * scale}px`,
            backgroundColor: config.backgroundColor,
            backgroundImage: config.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
            backgroundSize: 'cover'
        }}
    >
        {/* Scaled Inner Container */}
        <div style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none' // Display only
        }}>
            {fields.map(field => (
                <div
                    key={field.id}
                    style={{
                        position: 'absolute',
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: fields.findIndex(f => f.id === field.id),
                    }}
                >
                    {renderField(field)}
                </div>
            ))}
        </div>
    </div>
  );
};

export default ClockDisplay;
