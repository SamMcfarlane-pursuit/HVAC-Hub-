import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const THRESHOLD = 80;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (container.scrollTop === 0) {
                startY.current = e.touches[0].clientY;
                setIsPulling(true);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPulling || isRefreshing) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - startY.current;

            if (diff > 0 && container.scrollTop === 0) {
                e.preventDefault();
                setPullDistance(Math.min(diff * 0.5, THRESHOLD + 20));
            }
        };

        const handleTouchEnd = async () => {
            if (pullDistance >= THRESHOLD && !isRefreshing) {
                setIsRefreshing(true);
                setPullDistance(THRESHOLD);

                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                }
            }

            setIsPulling(false);
            setPullDistance(0);
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPulling, pullDistance, isRefreshing, onRefresh]);

    return (
        <div ref={containerRef} className="h-full overflow-y-auto relative">
            {/* Pull indicator */}
            <div
                className="absolute left-0 right-0 flex justify-center items-center transition-all pointer-events-none z-50"
                style={{
                    top: -40,
                    transform: `translateY(${pullDistance}px)`,
                    opacity: pullDistance / THRESHOLD
                }}
            >
                <div className={`p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: isPulling ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                {children}
            </div>
        </div>
    );
};
