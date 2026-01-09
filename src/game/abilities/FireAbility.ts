/**
 * ファイア能力 (Fire Ability)
 * 
 * 前方に持続的な炎の攻撃判定を出す。
 * カービィの前方に炎を噴射し、触れた敵にダメージを与える。
 */

import Phaser from 'phaser';
import {
  BaseAbility,
  type AbilityContext,
  type AbilityConfig,
  type HitboxConfig,
} from './BaseAbility';

const FIRE_CONFIG: AbilityConfig = {
  name: 'ファイア',
  type: 'FIRE',
  cooldown: 500,          // 0.5秒のクールダウン
  duration: 800,          // 0.8秒間炎を出し続ける
  damage: 1,
  color: 0xFF4500,        // オレンジレッド
  particleColor: 0xFF6600,
};

export class FireAbility extends BaseAbility {
  private flameParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  
  constructor() {
    super(FIRE_CONFIG);
  }
  
  // ============================================
  // 攻撃判定の設定
  // ============================================
  
  protected getHitboxConfig(): HitboxConfig {
    return {
      shape: 'rectangle',
      width: 120,           // 横長の判定
      height: 40,
      offsetX: 70,          // カービィの前方
      offsetY: 0,
    };
  }
  
  // ============================================
  // ライフサイクルメソッド
  // ============================================
  
  protected onActivate(context: AbilityContext): void {
    // 炎のパーティクルを生成
    this.createFlameParticles(context);
    
    // 発動時のスケールアニメーション
    context.scene.tweens.add({
      targets: context.owner,
      scaleX: 0.9,
      duration: 100,
      yoyo: true,
    });
  }
  
  protected onUpdate(context: AbilityContext, _delta: number): void {
    // パーティクルの位置を更新
    this.updateFlameParticles(context);
    
    // 揺れエフェクト
    const shake = Math.sin(Date.now() * 0.02) * 2;
    if (this.effectGraphics) {
      this.effectGraphics.y = shake;
    }
  }
  
  protected onDeactivate(_context: AbilityContext): void {
    // パーティクルを停止
    if (this.flameParticles) {
      this.flameParticles.stop();
      // 少し遅れて破棄
      setTimeout(() => {
        this.flameParticles?.destroy();
        this.flameParticles = null;
      }, 500);
    }
  }
  
  // ============================================
  // エフェクト描画
  // ============================================
  
  protected drawEffect(
    graphics: Phaser.GameObjects.Graphics,
    context: AbilityContext,
    progress: number
  ): void {
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    const x = context.owner.x;
    const y = context.owner.y;
    
    // 炎の基本形状を描画
    this.drawFlameShape(graphics, x, y, directionMultiplier, progress);
    
    // 炎の内側（明るい部分）
    this.drawFlameCore(graphics, x, y, directionMultiplier, progress);
  }
  
  private drawFlameShape(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    direction: number,
    progress: number
  ): void {
    const time = Date.now() * 0.01;
    const intensity = Math.min(progress * 2, 1); // 開始時にフェードイン
    
    // 外側の炎（オレンジ）
    graphics.fillStyle(0xFF4500, 0.6 * intensity);
    
    // 複数の炎の塊を描画
    for (let i = 0; i < 5; i++) {
      const wave = Math.sin(time + i * 0.5) * 5;
      const offsetX = (20 + i * 20) * direction;
      const offsetY = wave + Math.sin(time * 2 + i) * 3;
      const size = 25 - i * 3;
      
      graphics.fillEllipse(x + offsetX, y + offsetY, size * 1.5, size);
    }
    
    // 先端の炎
    const tipOffset = 110 * direction;
    const tipWave = Math.sin(time * 3) * 8;
    graphics.fillStyle(0xFF6600, 0.5 * intensity);
    graphics.fillEllipse(x + tipOffset, y + tipWave, 30, 20);
  }
  
  private drawFlameCore(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    direction: number,
    progress: number
  ): void {
    const time = Date.now() * 0.015;
    const intensity = Math.min(progress * 2, 1);
    
    // 内側の炎（黄色〜白）
    graphics.fillStyle(0xFFFF00, 0.7 * intensity);
    
    for (let i = 0; i < 4; i++) {
      const wave = Math.sin(time + i * 0.7) * 3;
      const offsetX = (15 + i * 15) * direction;
      const offsetY = wave;
      const size = 15 - i * 2;
      
      graphics.fillEllipse(x + offsetX, y + offsetY, size * 1.2, size);
    }
    
    // 中心の白い炎
    graphics.fillStyle(0xFFFFFF, 0.8 * intensity);
    const coreWave = Math.sin(time * 2) * 2;
    graphics.fillEllipse(x + 20 * direction, y + coreWave, 12, 10);
  }
  
  // ============================================
  // パーティクル管理
  // ============================================
  
  private createFlameParticles(context: AbilityContext): void {
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    
    // 炎のパーティクルテクスチャを動的生成
    if (!context.scene.textures.exists('particle-fire')) {
      const graphics = context.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xFF6600, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.fillStyle(0xFFFF00, 1);
      graphics.fillCircle(8, 8, 4);
      graphics.generateTexture('particle-fire', 16, 16);
      graphics.destroy();
    }
    
    this.flameParticles = context.scene.add.particles(
      context.owner.x + 30 * directionMultiplier,
      context.owner.y,
      'particle-fire',
      {
        speed: { min: 150, max: 300 },
        angle: directionMultiplier === 1 
          ? { min: -20, max: 20 }
          : { min: 160, max: 200 },
        scale: { start: 0.8, end: 0 },
        lifespan: { min: 200, max: 400 },
        frequency: 20,
        blendMode: Phaser.BlendModes.ADD,
        tint: [0xFF4500, 0xFF6600, 0xFFFF00],
      }
    );
    this.flameParticles.setDepth(14);
  }
  
  private updateFlameParticles(context: AbilityContext): void {
    if (!this.flameParticles) return;
    
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    this.flameParticles.setPosition(
      context.owner.x + 30 * directionMultiplier,
      context.owner.y
    );
  }
  
  // ============================================
  // 敵ヒット時のオーバーライド
  // ============================================
  
  protected onEnemyHit(context: AbilityContext, enemy: Phaser.Physics.Arcade.Sprite): void {
    // 燃焼エフェクト
    this.createBurnEffect(context, enemy.x, enemy.y);
    
    // 親クラスの処理（敵破壊 + スコア）
    super.onEnemyHit(context, enemy);
  }
  
  private createBurnEffect(context: AbilityContext, x: number, y: number): void {
    // 爆発的な炎エフェクト
    const burst = context.scene.add.particles(x, y, 'particle-fire', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      quantity: 15,
      blendMode: Phaser.BlendModes.ADD,
    });
    
    context.scene.time.delayedCall(600, () => burst.destroy());
    
    // 煙エフェクト
    if (!context.scene.textures.exists('particle-smoke')) {
      const graphics = context.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x333333, 0.6);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture('particle-smoke', 16, 16);
      graphics.destroy();
    }
    
    const smoke = context.scene.add.particles(x, y, 'particle-smoke', {
      speed: { min: 20, max: 50 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 800,
      quantity: 5,
    });
    
    context.scene.time.delayedCall(900, () => smoke.destroy());
  }
}
