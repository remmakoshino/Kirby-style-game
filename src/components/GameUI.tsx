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

const abilityColors: Record<CopyAbility, string> = {
  NONE: '#FFB6C1',
  FIRE: '#FF4500',
  ICE: '#00BFFF',
  SWORD: '#00FF00',
  BEAM: '#FF00FF',
  SPARK: '#00FFFF',
};

const abilityNames: Record<CopyAbility, string> = {
  NONE: '',
  FIRE: 'ファイア',
  ICE: 'アイス',
  SWORD: 'ソード',
  BEAM: 'ビーム',
  SPARK: 'スパーク',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: kirby.copyAbility !== 'NONE' 
              ? abilityColors[kirby.copyAbility] 
              : 'rgba(255, 255, 255, 0.2)',
            border: kirby.copyAbility !== 'NONE' 
              ? `3px solid ${abilityColors[kirby.copyAbility]}` 
              : '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: kirby.copyAbility !== 'NONE' 
              ? `0 0 15px ${abilityColors[kirby.copyAbility]}` 
              : 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '28px' }}>{abilityIcons[kirby.copyAbility]}</span>
          
          {/* クールダウンオーバーレイ */}
          {kirby.abilityCooldown > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: `${(1 - kirby.abilityCooldown) * 100}%`,
                  height: `${(1 - kirby.abilityCooldown) * 100}%`,
                  backgroundColor: abilityColors[kirby.copyAbility],
                  borderRadius: '50%',
                  opacity: 0.5,
                }}
              />
            </div>
          )}
        </div>
        
        {kirby.copyAbility !== 'NONE' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span 
              style={{ 
                fontWeight: 'bold',
                color: abilityColors[kirby.copyAbility],
                textShadow: `0 0 5px ${abilityColors[kirby.copyAbility]}`,
              }}
            >
              {abilityNames[kirby.copyAbility]}
            </span>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>
              Xキーで発動
            </span>
          </div>
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
          {kirby.isAbilityActive && ' (能力発動中)'}
        </div>
      )}
    </div>
  );
};
