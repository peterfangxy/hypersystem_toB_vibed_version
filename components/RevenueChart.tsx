
import React, { useMemo, useState } from 'react';
import { ChartDataPoint } from '../services/analyticsService';
import { THEME } from '../theme';

interface RevenueChartProps {
    data: ChartDataPoint[];
    height?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 250 }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxVal = useMemo(() => {
        const max = Math.max(...data.map(d => d.value));
        return max === 0 ? 100 : max * 1.1; // Add 10% headroom
    }, [data]);

    return (
        <div className="w-full flex flex-col">
            {/* Chart Area */}
            <div 
                className="w-full flex items-end justify-between gap-2 relative" 
                style={{ height: `${height}px` }}
            >
                {/* Horizontal Grid Lines (Decorative) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-t border-gray-500 w-full h-px"></div>
                    <div className="border-t border-gray-500 w-full h-px"></div>
                    <div className="border-t border-gray-500 w-full h-px"></div>
                    <div className="border-t border-gray-500 w-full h-px"></div>
                    <div className="border-t border-gray-500 w-full h-px"></div>
                </div>

                {data.map((point, index) => {
                    const percent = (point.value / maxVal) * 100;
                    const isHovered = hoveredIndex === index;

                    return (
                        <div 
                            key={point.fullDate}
                            className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Tooltip */}
                            {isHovered && (
                                <div className="absolute bottom-full mb-2 bg-[#222] text-white text-xs font-bold py-1 px-2 rounded shadow-xl border border-[#333] z-10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                                    <div className="text-gray-400 text-[10px] mb-0.5">{point.fullDate}</div>
                                    ${point.value.toLocaleString()}
                                </div>
                            )}

                            {/* Bar */}
                            <div 
                                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out ${
                                    point.value > 0 
                                    ? (isHovered ? 'bg-brand-green brightness-110' : 'bg-brand-green') 
                                    : 'bg-[#222]' // Empty placeholder bar
                                }`}
                                style={{ 
                                    height: point.value > 0 ? `${percent}%` : '4px',
                                    minHeight: '4px' 
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* X-Axis Labels */}
            <div className="w-full flex justify-between gap-2 mt-3 px-1">
                {data.map((point, index) => (
                    <div key={index} className="flex-1 text-center">
                        <span className="text-[10px] font-medium text-gray-500 block transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center mt-1">
                            {point.date}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RevenueChart;
