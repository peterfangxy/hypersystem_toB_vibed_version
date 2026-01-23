
import { useState, useRef, useCallback } from 'react';

interface DragState {
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    elementId: string;
}

interface CanvasInteractionOptions {
    enableSnap: boolean;
    snapInterval?: number;
    snapThreshold?: number;
}

export const useCanvasInteraction = (
    canvasRef: React.RefObject<HTMLDivElement>,
    onUpdate: (id: string, position: { x: number; y: number }) => void,
    options: CanvasInteractionOptions
) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<DragState | null>(null);

    const startDrag = useCallback((e: React.MouseEvent, elementId: string, currentX: number, currentY: number) => {
        // Prevent default browser drag behavior
        e.preventDefault(); 
        e.stopPropagation();
        
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: currentX,
            initialY: currentY,
            elementId
        };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !dragRef.current || !canvasRef.current) return;

        const { startX, startY, initialX, initialY, elementId } = dragRef.current;
        const rect = canvasRef.current.getBoundingClientRect();

        // Calculate delta in pixels
        const deltaXPx = e.clientX - startX;
        const deltaYPx = e.clientY - startY;

        // Convert delta to percentage of container size
        const deltaXPercent = (deltaXPx / rect.width) * 100;
        const deltaYPercent = (deltaYPx / rect.height) * 100;

        let newX = initialX + deltaXPercent;
        let newY = initialY + deltaYPercent;

        // Optional: Clamp to canvas bounds (0-100)
        // newX = Math.max(0, Math.min(100, newX));
        // newY = Math.max(0, Math.min(100, newY));

        // Grid Snapping Logic
        if (options.enableSnap) {
            const interval = options.snapInterval || 5;
            const threshold = options.snapThreshold || 1.5;

            const nearestGridX = Math.round(newX / interval) * interval;
            const nearestGridY = Math.round(newY / interval) * interval;

            if (Math.abs(newX - nearestGridX) < threshold) newX = nearestGridX;
            if (Math.abs(newY - nearestGridY) < threshold) newY = nearestGridY;
        }

        onUpdate(elementId, { x: newX, y: newY });
    }, [isDragging, canvasRef, onUpdate, options.enableSnap, options.snapInterval, options.snapThreshold]);

    const endDrag = useCallback(() => {
        setIsDragging(false);
        dragRef.current = null;
    }, []);

    return {
        isDragging,
        startDrag,
        handleMouseMove,
        endDrag
    };
};
