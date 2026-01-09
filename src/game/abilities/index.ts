/**
 * 能力ファクトリー
 * CopyAbility型からBaseAbilityインスタンスを生成する
 */

import type { CopyAbility } from '../../types/game.types';
import { BaseAbility } from './BaseAbility';
import { FireAbility } from './FireAbility';
import { SparkAbility } from './SparkAbility';
import { IceAbility } from './IceAbility';

/**
 * CopyAbility型に対応するBaseAbilityインスタンスを生成
 */
export function createAbility(type: CopyAbility): BaseAbility | null {
  switch (type) {
    case 'FIRE':
      return new FireAbility();
    case 'SPARK':
      return new SparkAbility();
    case 'ICE':
      return new IceAbility();
    case 'NONE':
    default:
      return null;
  }
}

/**
 * 能力の色を取得
 */
export function getAbilityColor(type: CopyAbility): number {
  switch (type) {
    case 'FIRE':
      return 0xFF4500;
    case 'SPARK':
      return 0x00FFFF;
    case 'ICE':
      return 0x00BFFF;
    case 'SWORD':
      return 0x00FF00;
    case 'BEAM':
      return 0xFF00FF;
    default:
      return 0xFFFFFF;
  }
}

/**
 * 能力の日本語名を取得
 */
export function getAbilityName(type: CopyAbility): string {
  switch (type) {
    case 'FIRE':
      return 'ファイア';
    case 'SPARK':
      return 'スパーク';
    case 'ICE':
      return 'アイス';
    case 'SWORD':
      return 'ソード';
    case 'BEAM':
      return 'ビーム';
    case 'NONE':
    default:
      return '';
  }
}

// エクスポート
export { BaseAbility } from './BaseAbility';
export { FireAbility } from './FireAbility';
export { SparkAbility } from './SparkAbility';
export { IceAbility } from './IceAbility';
export type { AbilityContext, AbilityConfig, HitboxConfig } from './BaseAbility';
