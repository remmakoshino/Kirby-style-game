/**
 * ワドルディのピクセルアートデータ
 * マインクラフト風の16x16ブロックデザイン
 */

import type { PixelColor } from '../utils/pixelArt';

// カラーパレット
const O = '#FF8C00'; // オレンジ（メイン）
const D = '#CC7000'; // ダークオレンジ（影）
const T = '#DEB887'; // タン（顔）
const t = '#F5DEB3'; // ライトタン（顔ハイライト）
const d = '#C4A46D'; // ダークタン（顔の影）
const W = '#FFFFFF'; // 白（目）
const B = '#000000'; // 黒（瞳・輪郭）
const Y = '#FFD700'; // 黄色（足）
const y = '#DAA520'; // ダークイエロー（足の影）
const C = '#FFB6C1'; // ピンク（頬）
const _ = null;      // 透明

/**
 * ワドルディ - 待機状態
 * 16x16 ピクセル
 */
export const WADDLE_DEE_IDLE: PixelColor[][] = [
  [_, _, _, _, _, O, O, O, O, O, O, _, _, _, _, _],
  [_, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, O, O, t, t, T, T, T, T, T, T, t, t, O, O, _],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, T, W, B, T, T, T, T, W, B, T, t, O, O],
  [O, O, t, T, W, B, T, T, T, T, W, B, T, t, O, O],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, C, T, T, T, T, T, T, T, T, C, t, O, O],
  [_, O, O, t, t, T, T, d, d, T, T, t, t, O, O, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, _, _, O, O, D, D, D, D, D, D, O, O, _, _, _],
  [_, _, Y, y, O, O, O, O, O, O, O, O, Y, y, _, _],
  [_, Y, Y, y, y, _, _, _, _, _, _, Y, Y, y, y, _],
];

/**
 * ワドルディ - 歩行フレーム1
 */
export const WADDLE_DEE_WALK1: PixelColor[][] = [
  [_, _, _, _, _, O, O, O, O, O, O, _, _, _, _, _],
  [_, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, O, O, t, t, T, T, T, T, T, T, t, t, O, O, _],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, T, W, B, T, T, T, T, W, B, T, t, O, O],
  [O, O, t, T, W, B, T, T, T, T, W, B, T, t, O, O],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, C, T, T, T, T, T, T, T, T, C, t, O, O],
  [_, O, O, t, t, T, T, d, d, T, T, t, t, O, O, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, Y, Y, y, O, O, D, D, D, D, O, O, _, _, _, _],
  [_, Y, Y, y, y, O, O, O, O, O, O, Y, Y, y, _, _],
  [_, _, _, _, _, _, _, _, _, _, Y, Y, y, y, _, _],
];

/**
 * ワドルディ - 歩行フレーム2
 */
export const WADDLE_DEE_WALK2: PixelColor[][] = [
  [_, _, _, _, _, O, O, O, O, O, O, _, _, _, _, _],
  [_, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, O, O, t, t, T, T, T, T, T, T, t, t, O, O, _],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, T, W, B, T, T, T, T, W, B, T, t, O, O],
  [O, O, t, T, W, B, T, T, T, T, W, B, T, t, O, O],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, C, T, T, T, T, T, T, T, T, C, t, O, O],
  [_, O, O, t, t, T, T, d, d, T, T, t, t, O, O, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, _, _, _, O, O, D, D, D, D, O, O, Y, Y, y, _],
  [_, _, Y, Y, y, O, O, O, O, O, O, Y, Y, y, y, _],
  [_, _, Y, Y, y, y, _, _, _, _, _, _, _, _, _, _],
];

/**
 * ワドルディ - 吸い込まれ中
 */
export const WADDLE_DEE_INHALED: PixelColor[][] = [
  [_, _, _, _, _, _, O, O, O, O, _, _, _, _, _, _],
  [_, _, _, _, O, O, O, O, O, O, O, O, _, _, _, _],
  [_, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _],
  [_, _, O, O, t, t, t, t, t, t, t, t, O, O, _, _],
  [_, _, O, t, t, T, T, T, T, T, T, t, t, O, _, _],
  [_, O, t, T, T, T, T, T, T, T, T, T, T, t, O, _],
  [_, O, t, T, B, B, T, T, T, T, B, B, T, t, O, _],
  [_, O, t, T, B, B, T, T, T, T, B, B, T, t, O, _],
  [_, O, t, T, T, T, T, T, T, T, T, T, T, t, O, _],
  [_, O, t, T, T, T, B, B, B, B, T, T, T, t, O, _],
  [_, _, O, t, t, T, T, d, d, T, T, t, t, O, _, _],
  [_, _, O, O, t, t, t, t, t, t, t, t, O, O, _, _],
  [_, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _],
  [_, _, _, _, O, O, D, D, D, D, O, O, _, _, _, _],
  [_, _, _, Y, y, O, O, O, O, O, O, Y, y, _, _, _],
  [_, _, _, Y, y, y, _, _, _, _, Y, Y, y, _, _, _],
];

/**
 * ファイア属性ワドルディ
 */
export const WADDLE_DEE_FIRE: PixelColor[][] = [
  [_, _, _, '#FF4500', '#FF4500', '#FF6347', '#FF6347', '#FF6347', '#FF6347', '#FF4500', '#FF4500', _, _, _, _, _],
  [_, _, '#FF4500', '#FF6347', '#FF6347', O, O, O, O, O, O, '#FF6347', '#FF4500', _, _, _],
  [_, '#FF4500', O, O, O, O, O, O, O, O, O, O, O, O, '#FF4500', _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, O, O, t, t, T, T, T, T, T, T, t, t, O, O, _],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, T, '#FF4500', B, T, T, T, T, '#FF4500', B, T, t, O, O],
  [O, O, t, T, '#FF4500', B, T, T, T, T, '#FF4500', B, T, t, O, O],
  [O, O, t, T, T, T, T, T, T, T, T, T, T, t, O, O],
  [O, O, t, '#FF6347', T, T, T, T, T, T, T, T, '#FF6347', t, O, O],
  [_, O, O, t, t, T, T, d, d, T, T, t, t, O, O, _],
  [_, O, O, O, t, t, t, t, t, t, t, t, O, O, O, _],
  [_, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _],
  [_, _, _, O, O, D, D, D, D, D, D, O, O, _, _, _],
  [_, _, Y, y, O, O, O, O, O, O, O, O, Y, y, _, _],
  [_, Y, Y, y, y, _, _, _, _, _, _, Y, Y, y, y, _],
];

/**
 * アイス属性ワドルディ
 */
export const WADDLE_DEE_ICE: PixelColor[][] = [
  [_, _, _, _, _, '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', _, _, _, _, _],
  [_, _, _, '#87CEEB', '#87CEEB', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#87CEEB', '#87CEEB', _, _, _],
  [_, _, '#87CEEB', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#87CEEB', _, _],
  [_, '#87CEEB', '#ADD8E6', '#ADD8E6', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#ADD8E6', '#ADD8E6', '#87CEEB', _],
  [_, '#87CEEB', '#ADD8E6', '#E0FFFF', '#E0FFFF', W, W, W, W, W, W, '#E0FFFF', '#E0FFFF', '#ADD8E6', '#87CEEB', _],
  ['#87CEEB', '#ADD8E6', '#E0FFFF', W, W, W, W, W, W, W, W, W, W, '#E0FFFF', '#ADD8E6', '#87CEEB'],
  ['#87CEEB', '#ADD8E6', '#E0FFFF', W, '#4169E1', B, W, W, W, W, '#4169E1', B, W, '#E0FFFF', '#ADD8E6', '#87CEEB'],
  ['#87CEEB', '#ADD8E6', '#E0FFFF', W, '#4169E1', B, W, W, W, W, '#4169E1', B, W, '#E0FFFF', '#ADD8E6', '#87CEEB'],
  ['#87CEEB', '#ADD8E6', '#E0FFFF', W, W, W, W, W, W, W, W, W, W, '#E0FFFF', '#ADD8E6', '#87CEEB'],
  ['#87CEEB', '#ADD8E6', '#E0FFFF', '#ADD8E6', W, W, W, W, W, W, W, W, '#ADD8E6', '#E0FFFF', '#ADD8E6', '#87CEEB'],
  [_, '#87CEEB', '#ADD8E6', '#E0FFFF', '#E0FFFF', W, W, '#B0C4DE', '#B0C4DE', W, W, '#E0FFFF', '#E0FFFF', '#ADD8E6', '#87CEEB', _],
  [_, '#87CEEB', '#ADD8E6', '#ADD8E6', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF', '#ADD8E6', '#ADD8E6', '#87CEEB', _],
  [_, _, '#87CEEB', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#87CEEB', _, _],
  [_, _, _, '#87CEEB', '#87CEEB', '#5F9EA0', '#5F9EA0', '#5F9EA0', '#5F9EA0', '#5F9EA0', '#5F9EA0', '#87CEEB', '#87CEEB', _, _, _],
  [_, _, '#4682B4', '#5F9EA0', '#87CEEB', '#87CEEB', '#87CEEB', '#87CEEB', '#87CEEB', '#87CEEB', '#87CEEB', '#87CEEB', '#4682B4', '#5F9EA0', _, _],
  [_, '#4682B4', '#4682B4', '#5F9EA0', '#5F9EA0', _, _, _, _, _, _, '#4682B4', '#4682B4', '#5F9EA0', '#5F9EA0', _],
];

// すべてのフレームをエクスポート
export const WADDLE_DEE_SPRITES = {
  idle: WADDLE_DEE_IDLE,
  walk1: WADDLE_DEE_WALK1,
  walk2: WADDLE_DEE_WALK2,
  inhaled: WADDLE_DEE_INHALED,
  fire: WADDLE_DEE_FIRE,
  ice: WADDLE_DEE_ICE,
};
