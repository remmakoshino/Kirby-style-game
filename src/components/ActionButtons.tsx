/**
 * アクションボタンコンポーネント
 * スマートフォン向けのA/Bボタン
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface ActionButtonProps {
  label: string;
  type: 'jump' | 'action';
  size?: number;
  color?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  type,
  size = 70,
  color = '#FF69B4',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const updateInput = useGameStore((state) => state.updateInput);
  const wasPressedRef = useRef(false);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    if (type === 'jump') {
      updateInput({ jump: true, jumpPressed: !wasPressedRef.current });
    } else {
      updateInput({ action: true, actionPressed: !wasPressedRef.current });
    }
    wasPressedRef.current = true;
  }, [type, updateInput]);

  const handleRelease = useCallback(() => {
    setIsPressed(false);
    if (type === 'jump') {
      updateInput({ jump: false, jumpPressed: false });
    } else {
      updateInput({ action: false, actionPressed: false });
    }
    wasPressedRef.current = false;
  }, [type, updateInput]);

  // タッチイベント
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handlePress();
    },
    [handlePress]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleRelease();
    },
    [handleRelease]
  );

  // マウスイベント（デバッグ用）
  useEffect(() => {
    const handleMouseUp = () => {
      if (isPressed) {
        handleRelease();
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isPressed, handleRelease]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handlePress}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isPressed ? color : `${color}CC`,
        border: `3px solid ${color}`,
        color: 'white',
        fontSize: size * 0.3,
        fontWeight: 'bold',
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isPressed
          ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
          : '0 4px 8px rgba(0, 0, 0, 0.3)',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.05s, box-shadow 0.05s',
      }}
    >
      {label}
    </button>
  );
};

/**
 * ボタングループ（A/Bボタンをまとめて配置）
 */
export const ActionButtons: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
        alignItems: 'center',
      }}
    >
      <ActionButton label="A" type="jump" color="#FF69B4" />
      <ActionButton label="B" type="action" color="#87CEEB" />
    </div>
  );
};
