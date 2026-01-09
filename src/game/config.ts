/**
 * Phaser ゲーム設定（レスポンシブ対応強化版）
 */

import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { DEFAULT_GAME_CONFIG } from '../types/game.types';

export const createGameConfig = (
  parent: HTMLElement | string,
  width: number = DEFAULT_GAME_CONFIG.width,
  height: number = DEFAULT_GAME_CONFIG.height
): Phaser.Types.Core.GameConfig => {
  // モバイル判定
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: '#87CEEB',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false, // デバッグ表示をオフに
      },
    },
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: {
        width: 320,
        height: 240,
      },
      max: {
        width: 1600,
        height: 1200,
      },
    },
    input: {
      activePointers: isMobile ? 4 : 1,
      touch: {
        capture: true,
      },
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    audio: {
      disableWebAudio: false,
    },
  };
};
