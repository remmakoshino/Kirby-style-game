/**
 * ゲームUI（スコア、コピー能力表示など）
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { CopyAbility, KirbyState } from '../types/game.types';

const abilityIcons: Record<CopyAbility, string> = {
  NONE: '🌸',
  FIRE: '🔥',
  ICE: '❄️',
  SWORD: '⚔️',
  BEAM: '✨',
  SPARK: '⚡',
};

const stateLabels: Record<KirbyState, string> = {
  IDLE: '待機',
  WALKING: '歩行',
  JUMPING: 'ジャンプ',
  FALLING: '落下',
  HOVERING: 'ホバリング',
  INHALING: '吸い込み',
  FULL: '頬張り',
  COPYING: 'コピー中',
  ATTACKING: '攻撃',
};

export const GameUI: React.FC = () => {
  const score = useGameStore((state) => state.score);
  const kirby = useGameStore((state) => state.kirby);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* スコア */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⭐ Score: {score}</span>
      </div>

      {/* コピー能力 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '24px' }}>{abilityIcons[kirby.copyAbility]}</span>
        {kirby.copyAbility !== 'NONE' && (
          <span>{kirby.copyAbility}</span>
        )}
      </div>

      {/* 状態（デバッグ用） */}
      {import.meta.env.DEV && (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '5px 10px',
            borderRadius: 5,
            fontSize: '12px',
          }}
        >
          状態: {stateLabels[kirby.state]}
        </div>
      )}
    </div>
  );
};
