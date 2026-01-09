/**
 * BossTextures - ボス用ピクセルアートテクスチャ生成
 * 
 * デデデ大王風の64x64ピクセルスプライトを動的生成
 */

import Phaser from 'phaser';
import type { PixelColor } from '../utils/pixelArt';
import { createPixelArtTexture } from '../utils/pixelArt';

// カラーパレット
const COLORS = {
  // デデデ（青いペンギン風）
  BODY_BLUE: '#4169E1',      // ロイヤルブルー
  BODY_LIGHT: '#6495ED',     // ライトブルー
  BELLY_CREAM: '#FFEFD5',    // クリーム色（おなか）
  BEAK_YELLOW: '#FFD700',    // 黄色（くちばし）
  BEAK_ORANGE: '#FFA500',    // オレンジ（くちばし下）
  EYE_WHITE: '#FFFFFF',
  EYE_BLACK: '#000000',
  CROWN_GOLD: '#FFD700',     // 王冠（金）
  CROWN_RED: '#FF0000',      // 王冠の宝石
  HAMMER_BROWN: '#8B4513',   // ハンマー柄
  HAMMER_HEAD: '#A0522D',    // ハンマーヘッド
  OUTLINE: '#1a1a3e',
};

// ボス待機スプライト (64x64)
const BOSS_IDLE_SPRITE = [
  '................................................................',
  '................................................................',
  '................GGGGGGGGGG......................................',
  '...............GYYYYYYYYYYYYG....................................',
  '..............GYYYYYRRYYYYYG.....................................',
  '..............GYYYYYYYYYYYYG.....................................',
  '.............GGGGGGGGGGGGGGG.....................................',
  '............OBBBBBBBBBBBBBBBO....................................',
  '...........OBBBBBLLLLLLBBBBBBO...................................',
  '..........OBBBBLLLLLLLLLBBBBBO...................................',
  '..........OBBBWWWWWBBWWWWBBBBO...................................',
  '.........OBBBLWKWWWBBWKWWLBBBO...................................',
  '.........OBBBLLLLLLBBLLLLLLBBO...................................',
  '........OBBBBBBBBBBBBBBBBBBBBO...................................',
  '........OBBBBBBBBYYBBBBBBBBBO....................................',
  '.......OBBBBBBBBYYYYBBBBBBBBBO...................................',
  '.......OBBBBBBBBOOOOBBBBBBBBO....................................',
  '......OBBBCCCCCCCCCCCCCCCBBBO....................................',
  '......OBBCCCCCCCCCCCCCCCCBBBO....................................',
  '.....OBBCCCCCCCCCCCCCCCCCBBBBO...................................',
  '.....OBBBCCCCCCCCCCCCCCCCBBBBO...................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '...OBBBBBCCCCCCCCCCCCCCCCBBBBBBO.................................',
  '...OBBBBBBCCCCCCCCCCCCCBBBBBBBO..................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '.OBBBBBBBO..........OBBBBBBBO....................................',
  '.OBBBBBO..............OBBBBO.....................................',
  '.OYYYYO................OYYYYO....................................',
  '.OYYYOO................OOYYYOO...................................',
  '..OOOO..................OOOOO....................................',
  '................................................................',
  // 残りは空白
].concat(Array(30).fill('................................................................'));

// ボスジャンプスプライト (64x64)
const BOSS_JUMP_SPRITE = [
  '................................................................',
  '................GGGGGGGGGG.......................................',
  '...............GYYYYYYYYYYYYG....................................',
  '..............GYYYYYRRYYYYYG.....................................',
  '..............GYYYYYYYYYYYYG.....................................',
  '.............GGGGGGGGGGGGGGG.....................................',
  '............OBBBBBBBBBBBBBBBO....................................',
  '...........OBBBBBLLLLLLBBBBBBO...................................',
  '..........OBBBBLLLLLLLLLBBBBBO...................................',
  '..........OBBBWWWWWBBWWWWBBBBO...................................',
  '.........OBBBLWKWWWBBWKWWLBBBO...................................',
  '.........OBBBLLLLLLBBLLLLLLBBO...................................',
  '........OBBBBBBBBBBBBBBBBBBBBO...................................',
  '........OBBBBBBBBYYBBBBBBBBBO....................................',
  '.......OBBBBBBBBYYYYBBBBBBBBBO...................................',
  '.......OBBBBBBBBOOOOBBBBBBBBO....................................',
  '......OBBBCCCCCCCCCCCCCCCBBBO....................................',
  '......OBBCCCCCCCCCCCCCCCCBBBO....................................',
  '.....OBBCCCCCCCCCCCCCCCCCBBBBO...................................',
  '.....OBBBCCCCCCCCCCCCCCCCBBBBO...................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '...OBBBBBCCCCCCCCCCCCCCCCBBBBBBO.................................',
  '...OBBBBBBCCCCCCCCCCCCCBBBBBBBO..................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '.OBBBBBBBO..........OBBBBBBBO....................................',
  'OBBBBBBBO............OBBBBBBBO...................................',
  'OYYYYO..................OYYYYO...................................',
  'OYYYYO..................OYYYYO...................................',
  '.OOO......................OOO....................................',
  '................................................................',
].concat(Array(32).fill('................................................................'));

// ボス着地スプライト (64x64)
const BOSS_LAND_SPRITE = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................GGGGGGGGGG.......................................',
  '...............GYYYYYYYYYYYYG....................................',
  '..............GYYYYYRRYYYYYG.....................................',
  '..............GYYYYYYYYYYYYG.....................................',
  '.............GGGGGGGGGGGGGGG.....................................',
  '............OBBBBBBBBBBBBBBBO....................................',
  '...........OBBBBBLLLLLLBBBBBBO...................................',
  '..........OBBBBLLLLLLLLLBBBBBO...................................',
  '..........OBBBWWWWWBBWWWWBBBBO...................................',
  '.........OBBBLWKWWWBBWKWWLBBBO...................................',
  '.........OBBBLLLLLLBBLLLLLLBBO...................................',
  '........OBBBBBBBBBBBBBBBBBBBBO...................................',
  '........OBBBBBBBBYYBBBBBBBBBO....................................',
  '.......OBBBBBBBBYYYYBBBBBBBBBO...................................',
  '.......OBBBBBBBBOOOOBBBBBBBBO....................................',
  '......OBBBCCCCCCCCCCCCCCCBBBO....................................',
  '......OBBCCCCCCCCCCCCCCCCBBBO....................................',
  '.....OBBCCCCCCCCCCCCCCCCCBBBBO...................................',
  '.....OBBBCCCCCCCCCCCCCCCCBBBBO...................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '...OBBBBBCCCCCCCCCCCCCCCCBBBBBBO.................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBBO..................................',
  '.OBBBBBBBBBBBBBBBBBBBBBBBBBBBBBO.................................',
  '.OBBBBBBBBBBBBBBBBBBBBBBBBBBBBO..................................',
  'OBBBBBO..................OBBBBBBO................................',
  'OYYYYYYO................OYYYYYYYO................................',
  '.OOOOOO..................OOOOOOO.................................',
  '................................................................',
].concat(Array(32).fill('................................................................'));

// ハンマースプライト1 (64x64)
const BOSS_HAMMER1_SPRITE = [
  '................................................................',
  '................................................................',
  '................GGGGGGGGGG.......................................',
  '...............GYYYYYYYYYYYYG...........HHHHHHHH.................',
  '..............GYYYYYRRYYYYYG...........HHHTTTTTTHHH..............',
  '..............GYYYYYYYYYYYYG..........HHHTTTTTTTTHH..............',
  '.............GGGGGGGGGGGGGGG.........HHHTTTTTTTTTHH..............',
  '............OBBBBBBBBBBBBBBBO........HHHTTTTTTTTTHH..............',
  '...........OBBBBBLLLLLLBBBBBBO........HHHTTTTTTTHH...............',
  '..........OBBBBLLLLLLLLLBBBBBO.........HHHHHHHHH.................',
  '..........OBBBWWWWWBBWWWWBBBBO..........MMMMM.....................',
  '.........OBBBLWKWWWBBWKWWLBBBO..........MMMMM.....................',
  '.........OBBBLLLLLLBBLLLLLLBBO..........MMMMM.....................',
  '........OBBBBBBBBBBBBBBBBBBBBO..........MMMMM.....................',
  '........OBBBBBBBBYYBBBBBBBBBO...........MMMMM.....................',
  '.......OBBBBBBBBYYYYBBBBBBBBBO..........MMMMM.....................',
  '.......OBBBBBBBBOOOOBBBBBBBBO.........BBMMMM......................',
  '......OBBBCCCCCCCCCCCCCCCBBBO........BBBMMM.......................',
  '......OBBCCCCCCCCCCCCCCCCBBBO.......BBBBMM........................',
  '.....OBBCCCCCCCCCCCCCCCCCBBBBO.....BBBBB..........................',
  '.....OBBBCCCCCCCCCCCCCCCCBBBBO.....................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO..................................',
  '...OBBBBBCCCCCCCCCCCCCCCCBBBBBBO.................................',
  '...OBBBBBBCCCCCCCCCCCCCBBBBBBBO..................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '.OBBBBBBBO..........OBBBBBBBO....................................',
  '.OBBBBBO..............OBBBBO.....................................',
  '.OYYYYO................OYYYYO....................................',
  '.OYYYOO................OOYYYOO...................................',
  '..OOOO..................OOOOO....................................',
].concat(Array(32).fill('................................................................'));

// ハンマースプライト2（振り下ろし）
const BOSS_HAMMER2_SPRITE = [
  '................................................................',
  '................................................................',
  '................GGGGGGGGGG.......................................',
  '...............GYYYYYYYYYYYYG....................................',
  '..............GYYYYYRRYYYYYG.....................................',
  '..............GYYYYYYYYYYYYG.....................................',
  '.............GGGGGGGGGGGGGGG.....................................',
  '............OBBBBBBBBBBBBBBBO....................................',
  '...........OBBBBBLLLLLLBBBBBBO...................................',
  '..........OBBBBLLLLLLLLLBBBBBO...................................',
  '..........OBBBWWWWWBBWWWWBBBBO...................................',
  '.........OBBBLWKWWWBBWKWWLBBBO...................................',
  '.........OBBBLLLLLLBBLLLLLLBBO..........HHHHHHHH.................',
  '........OBBBBBBBBBBBBBBBBBBBBO.........HHHTTTTTTHHH..............',
  '........OBBBBBBBBYYBBBBBBBBBO.........HHHTTTTTTTTHH..............',
  '.......OBBBBBBBBYYYYBBBBBBBBBO.......HHHTTTTTTTTTHH..............',
  '.......OBBBBBBBBOOOOBBBBBBBBO........HHHTTTTTTTTTHH..............',
  '......OBBBCCCCCCCCCCCCCCCBBBBO.......HHHHHHHHHHHHH...............',
  '......OBBCCCCCCCCCCCCCCCCBBBO........MMMMM........................',
  '.....OBBCCCCCCCCCCCCCCCCCBBBBO.......MMMMM........................',
  '.....OBBBCCCCCCCCCCCCCCCCBBBBO......BMMMMM........................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO....BBMMMMM........................',
  '....OBBBBCCCCCCCCCCCCCCCCBBBBBO...BBBMMMM.........................',
  '...OBBBBBCCCCCCCCCCCCCCCCBBBBBBO.BBBBMMM..........................',
  '...OBBBBBBCCCCCCCCCCCCCBBBBBBBO.BBBBB.............................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '..OBBBBBBBBBBBBBBBBBBBBBBBBBBO...................................',
  '.OBBBBBBBO..........OBBBBBBBO....................................',
  '.OBBBBBO..............OBBBBO.....................................',
  '.OYYYYO................OYYYYO....................................',
  '.OYYYOO................OOYYYOO...................................',
  '..OOOO..................OOOOO....................................',
].concat(Array(32).fill('................................................................'));

// 腹ばい突進スプライト
const BOSS_SLIDE_SPRITE = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '...........GGGGGGGGGG............................................',
  '..........GYYYYYYYYYYYYG.........................................',
  '.........GYYYYYRRYYYYYG..........................................',
  '.........GYYYYYYYYYYYYG..........................................',
  '........GGGGGGGGGGGGGGG..........................................',
  '.......OBBBBBBBBBBBBBBBO.........................................',
  '......OBBBBBLLLLLLBBBBBBO........................................',
  '.....OBBBBLLLLLLLLLBBBBBO........................................',
  '.....OBBBWWWWWBBWWWWBBBBO........................................',
  '....OBBBLWKWWWBBWKWWLBBBO........................................',
  '....OBBBLLLLLLBBLLLLLLBBO........................................',
  '...OBBBBBBBBBBBBBBBBBBBBO........................................',
  '..OBBBBBBBBYYBBBBBBBBBBBO........................................',
  '..OBBBBBBBBYYYYBBBBBBBBBBO.......................................',
  '.OBBBBBBBBBOOOOBBBBBBBBBO........................................',
  '.OBBBBCCCCCCCCCCCCCCCBBBO........................................',
  'OBBBBCCCCCCCCCCCCCCCCBBBBO.......................................',
  'OBBBCCCCCCCCCCCCCCCCCBBBBBO......................................',
  'OBBBBBBBBBBBBBBBBBBBBBBBBBO......................................',
  'OBBBBBBBBBBBBBBBBBBBBBBBBBBO.....................................',
  '.OYYYYO....OYYYYO....OYYYYO......................................',
  '..OOOO......OOOO......OOOO.......................................',
].concat(Array(30).fill('................................................................'));

// 撃破スプライト
const BOSS_DEFEATED_SPRITE = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '..............GGGGGGGGGG.........................................',
  '.............GYYYYYYYYYYYYG......................................',
  '............GYYYYYRRYYYYYG.......................................',
  '............GYYYYYYYYYYYYG.......................................',
  '...........GGGGGGGGGGGGGGG.......................................',
  '..........OBBBBBBBBBBBBBBBO......................................',
  '.........OBBBBBLLLLLLBBBBBBO.....................................',
  '........OBBBBLLLLLLLLLBBBBBO.....................................',
  '........OBBBXXXXXBBXXXXXBBBBO....................................',
  '.......OBBBLXXXXBBXXXXLBBBO......................................',
  '.......OBBBLLLLLLBBLLLLLLBBO.....................................',
  '......OBBBBBBBBBBBBBBBBBBBBO.....................................',
  '......OBBBBBBBBOOBBBBBBBBBO......................................',
  '.....OBBBBBBBBOOOOBBBBBBBBBBO....................................',
  '.....OBBBBBBBBOOOOBBBBBBBBO......................................',
  '....OBBBCCCCCCCCCCCCCCCBBBO......................................',
  '...OBBCCCCCCCCCCCCCCCCBBBO.......................................',
  '..OBBCCCCCCCCCCCCCCCCCBBBBO......................................',
  '.OBBBBBBBBBBBBBBBBBBBBBBBBBO.....................................',
  'OBBBBBBBBBBBBBBBBBBBBBBBBBBBO....................................',
  'OBBBBBBBBBBBBBBBBBBBBBBBBBBO.....................................',
  'OYYYYO......................OYYYYO...............................',
  '.OOO..........................OOO................................',
].concat(Array(28).fill('................................................................'));

// 衝撃波（星型）
const SHOCKWAVE_STAR_SPRITE = [
  '........YYYY........',
  '.......YYYYYY.......',
  '......YYYYYYYY......',
  '.....YYYYYYYYYY.....',
  'YYYYYYYYYYYYYYYYYYYY',
  '.YYYYYYYYYYYYYYYYYYYY',
  '..YYYYYYYYYYYYYYYYYY.',
  '...YYYYYYYYYYYYYYYYY..',
  '....YYYYYYYYYYYYYYYY...',
  '.....YYYYYYYYYYYYYY....',
  '......YYYYYYYYYY.......',
  '.....YYYYYYYYYYYYYY.....',
  '....YYYYYYYYYYYYYYYY....',
  '...YYYYYYYYYYYYYYYYYY...',
  '..YYYYYYYYYYYYYYYYYYYY..',
  '.YYYYYYYYYYYYYYYYYYYY...',
  'YYYYYYYYYYYYYYYYYYYY....',
  '.....YYYYYYYYYY.....',
  '......YYYYYYYY......',
  '.......YYYYYY.......',
  '........YYYY........',
];

// 色マッピング
const COLOR_MAP: Record<string, string> = {
  'O': COLORS.OUTLINE,
  'B': COLORS.BODY_BLUE,
  'L': COLORS.BODY_LIGHT,
  'C': COLORS.BELLY_CREAM,
  'Y': COLORS.BEAK_YELLOW,
  'R': COLORS.CROWN_RED,
  'G': COLORS.CROWN_GOLD,
  'W': COLORS.EYE_WHITE,
  'K': COLORS.EYE_BLACK,
  'H': COLORS.HAMMER_HEAD,
  'T': COLORS.HAMMER_BROWN,
  'M': COLORS.HAMMER_BROWN,
  'X': COLORS.EYE_BLACK, // X目
  '.': 'transparent',
};

/**
 * 文字列スプライトをPixelColor[][]に変換
 */
function convertSprite(
  sprite: string[],
  colorMap: Record<string, string>
): PixelColor[][] {
  return sprite.map(row => 
    row.split('').map(char => {
      const color = colorMap[char];
      return color === 'transparent' ? null : (color || null);
    })
  );
}

/**
 * ボス用テクスチャを生成
 */
export function createBossTextures(scene: Phaser.Scene): void {
  // ボススプライト生成
  createPixelArtTexture(scene, 'boss-idle', convertSprite(BOSS_IDLE_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-idle2', convertSprite(BOSS_IDLE_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-jump', convertSprite(BOSS_JUMP_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-land', convertSprite(BOSS_LAND_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-hammer1', convertSprite(BOSS_HAMMER1_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-hammer2', convertSprite(BOSS_HAMMER2_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-slide', convertSprite(BOSS_SLIDE_SPRITE, COLOR_MAP), 1);
  createPixelArtTexture(scene, 'boss-defeated', convertSprite(BOSS_DEFEATED_SPRITE, COLOR_MAP), 1);
  
  // 衝撃波用マッピング
  const starColorMap: Record<string, string> = {
    'Y': '#FFD700',
    '.': 'transparent',
  };
  createPixelArtTexture(scene, 'shockwave-star', convertSprite(SHOCKWAVE_STAR_SPRITE, starColorMap), 1);
}
