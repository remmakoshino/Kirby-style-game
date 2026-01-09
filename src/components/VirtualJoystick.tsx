/**
 * バーチャルジョイスティックコンポーネント
 * スマートフォン向けの左側ジョイスティック
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface VirtualJoystickProps {
  size?: number;
  stickSize?: number;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  size = 120,
  stickSize = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const updateInput = useGameStore((state) => state.updateInput);

  const maxDistance = (size - stickSize) / 2;

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;

      // 距離を計算
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 最大距離に制限
      if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
      }

      setStickPosition({ x: dx, y: dy });

      // -1 ~ 1 に正規化してストアに送信
      const normalizedX = dx / maxDistance;
      const normalizedY = dy / maxDistance;
      updateInput({ moveX: normalizedX, moveY: normalizedY });
    },
    [maxDistance, updateInput]
  );

  const handleEnd = useCallback(() => {
    setIsActive(false);
    setStickPosition({ x: 0, y: 0 });
    updateInput({ moveX: 0, moveY: 0 });
  }, [updateInput]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsActive(true);
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!isActive) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [isActive, handleMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleEnd();
    },
    [handleEnd]
  );

  // マウス対応（デバッグ用）
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isActive) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (isActive) {
        handleEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={(e) => {
        setIsActive(true);
        handleMove(e.clientX, e.clientY);
      }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        border: '3px solid rgba(255, 255, 255, 0.5)',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* スティック */}
      <div
        style={{
          width: stickSize,
          height: stickSize,
          borderRadius: '50%',
          backgroundColor: isActive
            ? 'rgba(255, 105, 180, 0.9)'
            : 'rgba(255, 255, 255, 0.7)',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${stickPosition.x}px), calc(-50% + ${stickPosition.y}px))`,
          transition: isActive ? 'none' : 'transform 0.1s ease-out',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      />
    </div>
  );
};
