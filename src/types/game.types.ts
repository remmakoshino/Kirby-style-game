/**
 * 星のカービィ風ゲーム - 型定義ファイル
 */

// ============================================
// カービィの状態定義
// ============================================

/** カービィの状態を表す列挙型 */
export type KirbyState =
  | 'IDLE'       // 待機状態
  | 'WALKING'    // 歩行中
  | 'JUMPING'    // ジャンプ中（上昇）
  | 'FALLING'    // 落下中
  | 'HOVERING'   // ホバリング中（膨らんだ状態）
  | 'INHALING'   // 吸い込み中
  | 'FULL'       // 頬張り状態（敵を吸い込んだ状態）
  | 'COPYING'    // コピー能力取得中
  | 'ATTACKING'; // 攻撃中

/** カービィの向き */
export type Direction = 'left' | 'right';

/** コピー能力の種類 */
export type CopyAbility =
  | 'NONE'       // 能力なし
  | 'FIRE'       // ファイア
  | 'ICE'        // アイス
  | 'SWORD'      // ソード
  | 'BEAM'       // ビーム
  | 'SPARK';     // スパーク

/** 敵キャラクターの属性 */
export type EnemyType =
  | 'NORMAL'     // 通常敵（コピー能力なし）
  | 'FIRE'       // 火属性
  | 'ICE'        // 氷属性
  | 'SWORD'      // 剣属性
  | 'BEAM'       // ビーム属性
  | 'SPARK';     // 電気属性

// ============================================
// ゲームオブジェクト型定義
// ============================================

/** カービィの状態データ */
export interface KirbyData {
  state: KirbyState;
  direction: Direction;
  copyAbility: CopyAbility;
  isOnGround: boolean;
  hoverTime: number;        // ホバリング継続時間
  maxHoverTime: number;     // 最大ホバリング時間
  inhaledEnemy: EnemyType | null; // 吸い込んだ敵の種類
  isAbilityActive: boolean; // 能力発動中フラグ
  abilityCooldown: number;  // 能力クールダウン残り時間(0-1)
}

/** 敵キャラクターのデータ */
export interface EnemyData {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  isBeingInhaled: boolean;  // 吸い込まれ中フラグ
  health: number;
}

/** ボスの状態データ */
export interface BossData {
  hp: number;
  maxHp: number;
  state: string;
  isDefeated: boolean;
}

/** 吸い込み判定エリアの設定 */
export interface InhaleArea {
  radius: number;           // 吸い込み範囲の半径
  angle: number;            // 扇形の角度（ラジアン）
  pullForce: number;        // 引き寄せる力
  captureDistance: number;  // この距離まで近づいたら捕獲
}

// ============================================
// 入力関連の型定義
// ============================================

/** バーチャルパッドの入力状態 */
export interface VirtualPadInput {
  // ジョイスティック
  joystickX: number;        // -1.0 ~ 1.0
  joystickY: number;        // -1.0 ~ 1.0
  
  // ボタン
  buttonA: boolean;         // ジャンプ/ホバリング
  buttonB: boolean;         // 吸い込み/攻撃
}

/** キーボード入力状態 */
export interface KeyboardInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;            // Spaceキー
  action: boolean;          // Xキー（吸い込み/攻撃）
}

/** 統合された入力状態 */
export interface GameInput {
  moveX: number;            // -1.0 ~ 1.0 (左右移動)
  moveY: number;            // -1.0 ~ 1.0 (上下)
  jump: boolean;            // ジャンプボタン
  jumpPressed: boolean;     // ジャンプボタンが押された瞬間
  action: boolean;          // アクションボタン
  actionPressed: boolean;   // アクションボタンが押された瞬間
}

// ============================================
// ゲーム設定の型定義
// ============================================

/** 物理パラメータ */
export interface PhysicsConfig {
  gravity: number;          // 重力
  walkSpeed: number;        // 歩行速度
  jumpVelocity: number;     // ジャンプ初速
  hoverVelocity: number;    // ホバリング上昇速度
  hoverFallSpeed: number;   // ホバリング時の降下速度
  maxFallSpeed: number;     // 最大落下速度
}

/** ゲーム全体の設定 */
export interface GameConfig {
  width: number;
  height: number;
  physics: PhysicsConfig;
  inhaleArea: InhaleArea;
}

// ============================================
// デフォルト値
// ============================================

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  gravity: 800,
  walkSpeed: 200,
  jumpVelocity: -350,
  hoverVelocity: -150,
  hoverFallSpeed: 50,
  maxFallSpeed: 400,
};

export const DEFAULT_INHALE_AREA: InhaleArea = {
  radius: 150,
  angle: Math.PI / 3,       // 60度
  pullForce: 300,
  captureDistance: 30,
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  width: 800,
  height: 600,
  physics: DEFAULT_PHYSICS_CONFIG,
  inhaleArea: DEFAULT_INHALE_AREA,
};

/** カービィの初期データ */
export const INITIAL_KIRBY_DATA: KirbyData = {
  state: 'IDLE',
  direction: 'right',
  copyAbility: 'NONE',
  isOnGround: true,
  hoverTime: 0,
  maxHoverTime: 3000,       // 3秒
  inhaledEnemy: null,
  isAbilityActive: false,
  abilityCooldown: 0,
};

/** ボスの初期データ */
export const INITIAL_BOSS_DATA: BossData = {
  hp: 100,
  maxHp: 100,
  state: 'IDLE',
  isDefeated: false,
};

/** 入力の初期状態 */
export const INITIAL_GAME_INPUT: GameInput = {
  moveX: 0,
  moveY: 0,
  jump: false,
  jumpPressed: false,
  action: false,
  actionPressed: false,
};

// ============================================
// ギミック型定義
// ============================================

/** ギミックの種類 */
export type ObstacleType = 
  | 'SPIKE'           // トゲ
  | 'MOVING_PLATFORM' // 動く床
  | 'FOOD'            // 回復アイテム
  | 'SPRING'          // ジャンプ台
  | 'BREAKABLE';      // 壊れるブロック

/** 動く床の移動パターン */
export type PlatformPattern = 
  | 'HORIZONTAL'      // 水平移動
  | 'VERTICAL'        // 垂直移動
  | 'CIRCULAR';       // 円運動

/** 動く床の設定 */
export interface MovingPlatformConfig {
  pattern: PlatformPattern;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;        // 移動速度
  waitTime?: number;    // 端での待機時間(ms)
}

/** トゲの設定 */
export interface SpikeConfig {
  damage: number;
  knockbackForce: number;
}

/** 回復アイテムの設定 */
export interface FoodConfig {
  healAmount: number;
  type: 'APPLE' | 'TOMATO' | 'MAXIM_TOMATO';
}

/** ギミック共通データ */
export interface ObstacleData {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}
