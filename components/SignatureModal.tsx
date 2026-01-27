
import React, { useRef, useState, useEffect } from 'react';
import { PenTool, CheckCircle, RotateCcw } from 'lucide-react';
import { Trans } from 'react-i18next';
import { Modal } from './ui/Modal';
import Button from './ui/Button';
import { THEME } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
  playerName: string;
  chipCount: number;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  playerName, 
  chipCount 
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered and canvas has dimensions
      setTimeout(initializeCanvas, 100);
    }
  }, [isOpen]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set internal resolution matches css size for sharpness
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    setHasSignature(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    }
  };

  const handleConfirm = () => {
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
          const dataUrl = canvas.toDataURL('image/png');
          onConfirm(dataUrl);
          onClose();
      }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('tournaments.signatureModal.title')}
      size="md"
    >
      <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto text-brand-green mb-4 border border-brand-green/20">
                  <PenTool size={32} />
              </div>
              <p className="text-lg text-white leading-relaxed">
                  <Trans
                    i18nKey="tournaments.signatureModal.confirmText"
                    values={{ name: playerName, chips: chipCount.toLocaleString() }}
                    components={{ bold: <span className="font-bold text-brand-green" /> }}
                  />
              </p>
              <p className="text-xs text-gray-500">
                  {t('tournaments.signatureModal.instruction')}
              </p>
          </div>

          <div className="relative">
              <div className="border-2 border-dashed border-[#444] rounded-xl bg-white overflow-hidden touch-none relative group">
                  <canvas 
                      ref={canvasRef}
                      className="w-full h-48 cursor-crosshair block"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                  />
                  {!hasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                          <span className="text-4xl font-serif text-gray-400 italic">{t('tournaments.signatureModal.placeholder')}</span>
                      </div>
                  )}
                  <button 
                      onClick={clearCanvas}
                      className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors shadow-sm"
                      title={t('tournaments.signatureModal.clear')}
                  >
                      <RotateCcw size={16} />
                  </button>
              </div>
          </div>

          <div className="flex gap-3">
              <Button 
                  variant="secondary" 
                  onClick={onClose} 
                  fullWidth
              >
                  {t('common.cancel')}
              </Button>
              <Button 
                  variant="primary" 
                  onClick={handleConfirm} 
                  disabled={!hasSignature}
                  fullWidth
                  icon={CheckCircle}
              >
                  {t('tournaments.signatureModal.confirm')}
              </Button>
          </div>
      </div>
    </Modal>
  );
};

export default SignatureModal;