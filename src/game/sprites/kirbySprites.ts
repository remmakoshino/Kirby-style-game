/**
 * カービィのピクセルアートデータ
 * マインクラフト風の16x16ブロックデザイン
 */

import type { PixelColor } from '../utils/pixelArt';

// カラーパレット
const P = '#FF69B4'; // ピンク（メイン）
const p = '#FFB6C1'; // ライトピンク（ハイライト）
const D = '#DB7093'; // ダークピンク（影）
const R = '#FF0000'; // 赤（足）
const r = '#CC0000'; // ダークレッド（足の影）
const W = '#FFFFFF'; // 白（目）
const B = '#000000'; // 黒（瞳）
const b = '#4169E1'; // 青（瞳の色）
const C = '#FFB6C1'; // 頬（チーク）
const _ = null;      // 透明

/**
 * カービィ - 待機状態（通常）
 * 16x16 ピクセル
 */
export const KIRBY_IDLE: PixelColor[][] = [
  [_, _, _, _, _, p, p, p, p, p, p, _, _, _, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, p, p, _, _, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, W, W, P, P, P, P, W, W, P, P, p, _],
  [p, P, P, P, W, B, b, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, W, B, b, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, C, P, P, P, P, P, P, P, P, P, P, C, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [_, p, P, P, P, P, P, D, D, P, P, P, P, P, p, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, _, R, r, P, P, P, P, P, P, P, P, R, r, _, _],
  [_, R, R, r, r, p, p, p, p, p, p, R, R, r, r, _],
  [_, R, R, r, r, _, _, _, _, _, _, R, R, r, r, _],
];

/**
 * カービィ - 歩行フレーム1
 */
export const KIRBY_WALK1: PixelColor[][] = [
  [_, _, _, _, _, p, p, p, p, p, p, _, _, _, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, p, p, _, _, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, W, W, P, P, P, P, W, W, P, P, p, _],
  [p, P, P, P, W, B, b, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, W, B, b, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, C, P, P, P, P, P, P, P, P, P, P, C, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [_, p, P, P, P, P, P, D, D, P, P, P, P, P, p, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, R, R, r, P, P, P, P, P, P, P, p, _, _, _, _],
  [_, R, R, r, r, p, p, p, p, p, R, R, r, r, _, _],
  [_, _, _, _, _, _, _, _, _, _, R, R, r, r, _, _],
];

/**
 * カービィ - 歩行フレーム2
 */
export const KIRBY_WALK2: PixelColor[][] = [
  [_, _, _, _, _, p, p, p, p, p, p, _, _, _, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, p, p, _, _, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, W, W, P, P, P, P, W, W, P, P, p, _],
  [p, P, P, P, W, B, b, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, W, B, b, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, C, P, P, P, P, P, P, P, P, P, P, C, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [_, p, P, P, P, P, P, D, D, P, P, P, P, P, p, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, _, _, _, p, P, P, P, P, P, P, R, R, r, _, _],
  [_, _, R, R, r, r, p, p, p, p, p, R, R, r, r, _],
  [_, _, R, R, r, r, _, _, _, _, _, _, _, _, _, _],
];

/**
 * カービィ - ジャンプ
 */
export const KIRBY_JUMP: PixelColor[][] = [
  [_, _, _, _, p, p, p, p, p, p, p, p, _, _, _, _],
  [_, _, p, p, P, P, P, P, P, P, P, P, p, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, P, W, W, P, P, P, P, P, P, W, W, P, P, p],
  [p, P, P, W, B, b, P, P, P, P, W, B, b, P, P, p],
  [p, P, P, W, B, b, P, P, P, P, W, B, b, P, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, C, P, P, P, P, P, P, P, P, P, P, C, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, p, p, _, _, _],
  [_, R, R, r, _, p, p, p, p, p, p, _, R, R, r, _],
  [R, R, R, r, r, _, _, _, _, _, _, R, R, R, r, r],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

/**
 * カービィ - ホバリング（膨らみ）
 * 20x16 ピクセル（横に大きい）
 */
export const KIRBY_HOVER: PixelColor[][] = [
  [_, _, _, _, _, _, p, p, p, p, p, p, p, p, _, _, _, _, _, _],
  [_, _, _, _, p, p, P, P, P, P, P, P, P, P, p, p, _, _, _, _],
  [_, _, _, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, W, W, W, P, P, P, P, P, P, W, W, W, P, P, p, _],
  [p, P, P, P, W, W, B, b, P, P, P, P, W, W, B, b, P, P, P, p],
  [p, P, P, P, W, W, B, b, P, P, P, P, W, W, B, b, P, P, P, p],
  [p, P, C, P, P, P, P, P, P, P, P, P, P, P, P, P, P, C, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, P, P, P, P, p, p, _, _, _],
  [_, _, R, R, r, p, p, p, p, p, p, p, p, p, p, R, R, r, _, _],
  [_, _, R, R, r, r, _, _, _, _, _, _, _, _, R, R, r, r, _, _],
];

/**
 * カービィ - 頬張り状態
 * 18x16 ピクセル
 */
export const KIRBY_FULL: PixelColor[][] = [
  [_, _, _, _, _, p, p, p, p, p, p, p, p, _, _, _, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, P, P, p, p, _, _, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, W, W, P, P, P, P, P, P, W, W, P, P, p, _],
  [p, P, P, P, W, B, b, P, P, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, W, B, b, P, P, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, C, P, P, D, D, D, D, D, D, D, D, P, P, C, P, p],
  [p, P, P, P, D, D, D, D, D, D, D, D, D, D, P, P, P, p],
  [_, p, P, P, D, D, D, D, D, D, D, D, D, D, P, P, p, _],
  [_, p, P, P, P, D, D, D, D, D, D, D, D, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, _, R, r, P, P, P, P, P, P, P, P, P, P, R, r, _, _],
  [_, R, R, r, r, p, p, p, p, p, p, p, p, R, R, r, r, _],
  [_, R, R, r, r, _, _, _, _, _, _, _, _, R, R, r, r, _],
];

/**
 * カービィ - 吸い込み
 * 18x16 ピクセル
 */
export const KIRBY_INHALE: PixelColor[][] = [
  [_, _, _, _, _, p, p, p, p, p, p, p, p, _, _, _, _, _],
  [_, _, _, p, p, P, P, P, P, P, P, P, P, p, p, _, _, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p, _],
  [_, p, P, P, W, W, P, P, P, P, P, P, W, W, P, P, p, _],
  [p, P, P, P, W, B, b, P, P, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, W, B, b, P, P, P, P, W, B, b, P, P, P, p],
  [p, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, p],
  [p, P, C, P, P, P, B, B, B, B, B, B, P, P, P, C, P, p],
  [p, P, P, P, P, B, _, _, _, _, _, _, B, P, P, P, P, p],
  [_, p, P, P, P, B, _, _, _, _, _, _, B, P, P, P, p, _],
  [_, p, P, P, P, P, B, B, B, B, B, B, P, P, P, P, p, _],
  [_, _, p, P, P, P, P, P, P, P, P, P, P, P, P, p, _, _],
  [_, _, R, r, P, P, P, P, P, P, P, P, P, P, R, r, _, _],
  [_, R, R, r, r, p, p, p, p, p, p, p, p, R, R, r, r, _],
  [_, R, R, r, r, _, _, _, _, _, _, _, _, R, R, r, r, _],
];

// すべてのフレームをエクスポート
export const KIRBY_SPRITES = {
  idle: KIRBY_IDLE,
  walk1: KIRBY_WALK1,
  walk2: KIRBY_WALK2,
  jump: KIRBY_JUMP,
  hover: KIRBY_HOVER,
  full: KIRBY_FULL,
  inhale: KIRBY_INHALE,
};
