/**
 * ゲーム状態管理ストア（Zustand）
 * ReactとPhaserの間で状態を共有するためのストア
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  KirbyState,
  Direction,
  CopyAbility,
  EnemyType,
  GameInput,
  KirbyData,
  EnemyData,
} from '../types/game.types';
import {
  INITIAL_KIRBY_DATA,
  INITIAL_GAME_INPUT,
} from '../types/game.types';

// ============================================
// ストアの型定義
// ============================================

interface GameStore {
  // ゲーム全体の状態
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  
  // カービィの状態
  kirby: KirbyData;
  
  // 敵キャラクター
  enemies: EnemyData[];
  
  // 入力状態（バーチャルパッドからの入力）
  input: GameInput;
  
  // ============================================
  // アクション：ゲーム制御
  // ============================================
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  
  // ============================================
  // アクション：カービィの状態更新
  // ============================================
  setKirbyState: (state: KirbyState) => void;
  setKirbyDirection: (direction: Direction) => void;
  setKirbyOnGround: (isOnGround: boolean) => void;
  setKirbyHoverTime: (time: number) => void;
  
  /** 敵を吸い込んだ時 */
  inhaleEnemy: (enemyType: EnemyType) => void;
  
  /** コピー能力を取得 */
  setCopyAbility: (ability: CopyAbility) => void;
  
  /** 頬張り状態を解除（吐き出し） */
  releaseEnemy: () => void;
  
  /** コピー能力を失う */
  loseCopyAbility: () => void;
  
  // ============================================
  // アクション：敵の管理
  // ============================================
  addEnemy: (enemy: EnemyData) => void;
  removeEnemy: (id: string) => void;
  updateEnemyPosition: (id: string, x: number, y: number) => void;
  setEnemyBeingInhaled: (id: string, isBeingInhaled: boolean) => void;
  
  // ============================================
  // アクション：入力状態の更新
  // ============================================
  updateInput: (input: Partial<GameInput>) => void;
  resetInput: () => void;
}

// ============================================
// ストアの実装
// ============================================

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, _get) => ({
    // 初期状態
    isPlaying: false,
    isPaused: false,
    score: 0,
    kirby: { ...INITIAL_KIRBY_DATA },
    enemies: [],
    input: { ...INITIAL_GAME_INPUT },
    
    // ============================================
    // ゲーム制御
    // ============================================
    startGame: () => set({
      isPlaying: true,
      isPaused: false,
      score: 0,
      kirby: { ...INITIAL_KIRBY_DATA },
      enemies: [],
    }),
    
    pauseGame: () => set({ isPaused: true }),
    
    resumeGame: () => set({ isPaused: false }),
    
    resetGame: () => set({
      isPlaying: false,
      isPaused: false,
      score: 0,
      kirby: { ...INITIAL_KIRBY_DATA },
      enemies: [],
      input: { ...INITIAL_GAME_INPUT },
    }),
    
    addScore: (points) => set((state) => ({
      score: state.score + points,
    })),
    
    // ============================================
    // カービィの状態更新
    // ============================================
    setKirbyState: (state) => set((prev) => ({
      kirby: { ...prev.kirby, state },
    })),
    
    setKirbyDirection: (direction) => set((prev) => ({
      kirby: { ...prev.kirby, direction },
    })),
    
    setKirbyOnGround: (isOnGround) => set((prev) => ({
      kirby: { ...prev.kirby, isOnGround },
    })),
    
    setKirbyHoverTime: (hoverTime) => set((prev) => ({
      kirby: { ...prev.kirby, hoverTime },
    })),
    
    inhaleEnemy: (enemyType) => set((prev) => ({
      kirby: {
        ...prev.kirby,
        state: 'FULL',
        inhaledEnemy: enemyType,
      },
    })),
    
    setCopyAbility: (ability) => set((prev) => ({
      kirby: {
        ...prev.kirby,
        state: 'IDLE',
        copyAbility: ability,
        inhaledEnemy: null,
      },
    })),
    
    releaseEnemy: () => set((prev) => ({
      kirby: {
        ...prev.kirby,
        state: 'IDLE',
        inhaledEnemy: null,
      },
    })),
    
    loseCopyAbility: () => set((prev) => ({
      kirby: {
        ...prev.kirby,
        copyAbility: 'NONE',
      },
    })),
    
    // ============================================
    // 敵の管理
    // ============================================
    addEnemy: (enemy) => set((state) => ({
      enemies: [...state.enemies, enemy],
    })),
    
    removeEnemy: (id) => set((state) => ({
      enemies: state.enemies.filter((e) => e.id !== id),
    })),
    
    updateEnemyPosition: (id, x, y) => set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === id ? { ...e, x, y } : e
      ),
    })),
    
    setEnemyBeingInhaled: (id, isBeingInhaled) => set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === id ? { ...e, isBeingInhaled } : e
      ),
    })),
    
    // ============================================
    // 入力状態の更新
    // ============================================
    updateInput: (input) => set((state) => ({
      input: { ...state.input, ...input },
    })),
    
    resetInput: () => set({
      input: { ...INITIAL_GAME_INPUT },
    }),
  }))
);

// ============================================
// Phaser から直接アクセスするためのヘルパー
// ============================================

/** 現在のゲーム入力を取得 */
export const getGameInput = (): GameInput => useGameStore.getState().input;

/** カービィの状態を取得 */
export const getKirbyData = (): KirbyData => useGameStore.getState().kirby;

/** 敵リストを取得 */
export const getEnemies = (): EnemyData[] => useGameStore.getState().enemies;

/** ストアのアクションを取得 */
export const getGameActions = () => {
  const state = useGameStore.getState();
  return {
    setKirbyState: state.setKirbyState,
    setKirbyDirection: state.setKirbyDirection,
    setKirbyOnGround: state.setKirbyOnGround,
    setKirbyHoverTime: state.setKirbyHoverTime,
    inhaleEnemy: state.inhaleEnemy,
    setCopyAbility: state.setCopyAbility,
    releaseEnemy: state.releaseEnemy,
    addEnemy: state.addEnemy,
    removeEnemy: state.removeEnemy,
    updateEnemyPosition: state.updateEnemyPosition,
    setEnemyBeingInhaled: state.setEnemyBeingInhaled,
    addScore: state.addScore,
  };
};
