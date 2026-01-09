/**
 * コピー能力の基底クラス（抽象クラス）
 * 
 * 全てのコピー能力はこのクラスを継承して実装する。
 * テンプレートメソッドパターンを使用し、共通処理を基底クラスで、
 * 能力固有の処理をサブクラスで実装する。
 */

import Phaser from 'phaser';
import type { CopyAbility, Direction } from '../../types/game.types';
import { getGameActions } from '../../store/gameStore';

// ============================================
// 型定義
// ============================================

/** 能力実行時のコンテキスト情報 */
export interface AbilityContext {
  scene: Phaser.Scene;
  owner: Phaser.Physics.Arcade.Sprite;
  direction: Direction;
  enemies: Phaser.Physics.Arcade.Group;
  platforms: Phaser.Physics.Arcade.StaticGroup;
}

/** 能力の設定 */
export interface AbilityConfig {
  name: string;
  type: CopyAbility;
  cooldown: number;        // クールダウン時間(ms)
  duration: number;        // 能力発動時間(ms)
  damage: number;          // 与えるダメージ
  color: number;           // 能力のテーマカラー
  particleColor: number;   // パーティクルの色
}

/** 攻撃判定の形状 */
export type HitboxShape = 'circle' | 'rectangle' | 'cone';

/** 攻撃判定の設定 */
export interface HitboxConfig {
  shape: HitboxShape;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  radius?: number;          // 円形の場合の半径
  angle?: number;           // 扇形の場合の角度
}

// ============================================
// 抽象クラス BaseAbility
// ============================================

export abstract class BaseAbility {
  protected config: AbilityConfig;
  protected isActive = false;
  protected cooldownTimer = 0;
  protected activeTimer = 0;
  protected hitbox: Phaser.GameObjects.Zone | null = null;
  protected effectGraphics: Phaser.GameObjects.Graphics | null = null;
  protected particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  
  constructor(config: AbilityConfig) {
    this.config = config;
  }
  
  // ============================================
  // ゲッター
  // ============================================
  
  get name(): string {
    return this.config.name;
  }
  
  get type(): CopyAbility {
    return this.config.type;
  }
  
  get color(): number {
    return this.config.color;
  }
  
  get isOnCooldown(): boolean {
    return this.cooldownTimer > 0;
  }
  
  get cooldownProgress(): number {
    return this.cooldownTimer / this.config.cooldown;
  }
  
  // ============================================
  // テンプレートメソッド
  // ============================================
  
  /**
   * 能力を発動する（テンプレートメソッド）
   * @returns 発動に成功したかどうか
   */
  public execute(context: AbilityContext): boolean {
    if (this.isOnCooldown || this.isActive) {
      return false;
    }
    
    this.isActive = true;
    this.activeTimer = this.config.duration;
    
    // サブクラスの初期化処理
    this.onActivate(context);
    
    // 攻撃判定を生成
    this.createHitbox(context);
    
    // エフェクトを生成
    this.createEffect(context);
    
    return true;
  }
  
  /**
   * 毎フレームの更新処理
   */
  public update(context: AbilityContext, delta: number): void {
    // クールダウンタイマー更新
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= delta;
      if (this.cooldownTimer < 0) this.cooldownTimer = 0;
    }
    
    // アクティブ状態の更新
    if (this.isActive) {
      this.activeTimer -= delta;
      
      // サブクラスの更新処理
      this.onUpdate(context, delta);
      
      // ヒットボックスの位置更新
      this.updateHitbox(context);
      
      // エフェクトの位置更新
      this.updateEffect(context, delta);
      
      // 敵との衝突判定
      this.checkEnemyCollision(context);
      
      // 発動時間終了
      if (this.activeTimer <= 0) {
        this.deactivate(context);
      }
    }
  }
  
  /**
   * 能力を停止する
   */
  public deactivate(context: AbilityContext): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.cooldownTimer = this.config.cooldown;
    
    // クリーンアップ
    this.destroyHitbox();
    this.destroyEffect(context);
    
    // サブクラスの終了処理
    this.onDeactivate(context);
  }
  
  /**
   * リソースを解放する
   */
  public destroy(): void {
    this.hitbox?.destroy();
    this.effectGraphics?.destroy();
    this.particles?.destroy();
    this.hitbox = null;
    this.effectGraphics = null;
    this.particles = null;
  }
  
  // ============================================
  // 抽象メソッド（サブクラスで実装必須）
  // ============================================
  
  /** 能力発動時の初期化処理 */
  protected abstract onActivate(context: AbilityContext): void;
  
  /** 毎フレームの更新処理 */
  protected abstract onUpdate(context: AbilityContext, delta: number): void;
  
  /** 能力終了時の処理 */
  protected abstract onDeactivate(context: AbilityContext): void;
  
  /** 攻撃判定の設定を取得 */
  protected abstract getHitboxConfig(): HitboxConfig;
  
  /** エフェクト描画 */
  protected abstract drawEffect(
    graphics: Phaser.GameObjects.Graphics,
    context: AbilityContext,
    progress: number
  ): void;
  
  // ============================================
  // ヒットボックス管理
  // ============================================
  
  protected createHitbox(context: AbilityContext): void {
    const hitboxConfig = this.getHitboxConfig();
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    
    const x = context.owner.x + hitboxConfig.offsetX * directionMultiplier;
    const y = context.owner.y + hitboxConfig.offsetY;
    
    this.hitbox = context.scene.add.zone(
      x, y,
      hitboxConfig.width,
      hitboxConfig.height
    );
    
    context.scene.physics.add.existing(this.hitbox, false);
    (this.hitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  }
  
  protected updateHitbox(context: AbilityContext): void {
    if (!this.hitbox) return;
    
    const hitboxConfig = this.getHitboxConfig();
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    
    this.hitbox.x = context.owner.x + hitboxConfig.offsetX * directionMultiplier;
    this.hitbox.y = context.owner.y + hitboxConfig.offsetY;
  }
  
  protected destroyHitbox(): void {
    this.hitbox?.destroy();
    this.hitbox = null;
  }
  
  // ============================================
  // エフェクト管理
  // ============================================
  
  protected createEffect(context: AbilityContext): void {
    this.effectGraphics = context.scene.add.graphics();
    this.effectGraphics.setDepth(15);
  }
  
  protected updateEffect(context: AbilityContext, _delta: number): void {
    if (!this.effectGraphics) return;
    
    this.effectGraphics.clear();
    
    const progress = 1 - (this.activeTimer / this.config.duration);
    this.drawEffect(this.effectGraphics, context, progress);
  }
  
  protected destroyEffect(_context: AbilityContext): void {
    this.effectGraphics?.destroy();
    this.effectGraphics = null;
  }
  
  // ============================================
  // 衝突判定
  // ============================================
  
  protected checkEnemyCollision(context: AbilityContext): void {
    if (!this.hitbox) return;
    
    const hitboxBounds = this.hitbox.getBounds();
    
    context.enemies.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const enemyBounds = enemy.getBounds();
      
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitboxBounds, enemyBounds)) {
        this.onEnemyHit(context, enemy);
      }
    });
  }
  
  /** 敵にヒットした時の処理（オーバーライド可能） */
  protected onEnemyHit(context: AbilityContext, enemy: Phaser.Physics.Arcade.Sprite): void {
    const enemyId = enemy.getData('id') as string;
    
    // ダメージエフェクト
    this.createHitEffect(context, enemy.x, enemy.y);
    
    // 敵を破壊
    const actions = getGameActions();
    actions.removeEnemy(enemyId);
    actions.addScore(150);
    
    enemy.destroy();
  }
  
  protected createHitEffect(context: AbilityContext, x: number, y: number): void {
    // ヒットエフェクト（白いフラッシュ + パーティクル）
    const flash = context.scene.add.circle(x, y, 30, 0xFFFFFF, 1);
    flash.setDepth(20);
    
    context.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
    
    // ダメージパーティクル
    const particles = context.scene.add.particles(x, y, 'particle-inhale', {
      tint: this.config.particleColor,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 8,
    });
    
    context.scene.time.delayedCall(500, () => particles.destroy());
  }
}
