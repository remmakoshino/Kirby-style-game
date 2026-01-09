/**
 * スパーク能力 (Spark Ability) / サンダー
 * 
 * 周囲に円形の電撃攻撃判定を展開する。
 * カービィを中心に全方位に電撃が走り、触れた敵にダメージを与える。
 */

import Phaser from 'phaser';
import {
  BaseAbility,
  type AbilityContext,
  type AbilityConfig,
  type HitboxConfig,
} from './BaseAbility';

const SPARK_CONFIG: AbilityConfig = {
  name: 'スパーク',
  type: 'SPARK',
  cooldown: 800,          // 0.8秒のクールダウン
  duration: 600,          // 0.6秒間放電
  damage: 1,
  color: 0x00FFFF,        // シアン
  particleColor: 0xFFFF00, // 黄色
};

// 電撃の軌道を表すインターフェース
interface LightningBolt {
  angle: number;
  segments: Phaser.Math.Vector2[];
  lifetime: number;
  maxLifetime: number;
}

export class SparkAbility extends BaseAbility {
  private lightningBolts: LightningBolt[] = [];
  private sparkParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private boltTimer = 0;
  private readonly BOLT_INTERVAL = 50; // 50msごとに新しい雷を生成
  
  constructor() {
    super(SPARK_CONFIG);
  }
  
  // ============================================
  // 攻撃判定の設定
  // ============================================
  
  protected getHitboxConfig(): HitboxConfig {
    return {
      shape: 'circle',
      width: 160,           // 円形の判定（直径）
      height: 160,
      offsetX: 0,           // カービィを中心
      offsetY: 0,
      radius: 80,
    };
  }
  
  // ============================================
  // ライフサイクルメソッド
  // ============================================
  
  protected onActivate(context: AbilityContext): void {
    this.lightningBolts = [];
    this.boltTimer = 0;
    
    // 電撃パーティクルを生成
    this.createSparkParticles(context);
    
    // 発動時のフラッシュ
    const flash = context.scene.add.circle(
      context.owner.x,
      context.owner.y,
      100,
      0xFFFFFF,
      0.8
    );
    flash.setDepth(16);
    
    context.scene.tweens.add({
      targets: flash,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
    
    // カービィのスケールアニメーション
    context.scene.tweens.add({
      targets: context.owner,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
    });
  }
  
  protected onUpdate(context: AbilityContext, delta: number): void {
    // 新しい雷を生成
    this.boltTimer += delta;
    if (this.boltTimer >= this.BOLT_INTERVAL) {
      this.boltTimer = 0;
      this.createLightningBolt();
    }
    
    // 既存の雷を更新
    this.updateLightningBolts(delta);
    
    // パーティクルの位置を更新
    this.updateSparkParticles(context);
  }
  
  protected onDeactivate(_context: AbilityContext): void {
    this.lightningBolts = [];
    
    if (this.sparkParticles) {
      this.sparkParticles.stop();
      setTimeout(() => {
        this.sparkParticles?.destroy();
        this.sparkParticles = null;
      }, 400);
    }
  }
  
  // ============================================
  // 雷の生成と管理
  // ============================================
  
  private createLightningBolt(): void {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const segments: Phaser.Math.Vector2[] = [];
    
    // 雷の軌道を生成（ジグザグ）
    const segmentCount = 6;
    const radius = 80;
    
    for (let i = 0; i <= segmentCount; i++) {
      const progress = i / segmentCount;
      const r = radius * progress;
      
      // ジグザグ効果
      let zigzag = 0;
      if (i > 0 && i < segmentCount) {
        zigzag = Phaser.Math.FloatBetween(-15, 15);
      }
      
      const x = Math.cos(angle) * r + Math.sin(angle) * zigzag;
      const y = Math.sin(angle) * r - Math.cos(angle) * zigzag;
      
      segments.push(new Phaser.Math.Vector2(x, y));
    }
    
    this.lightningBolts.push({
      angle,
      segments,
      lifetime: 0,
      maxLifetime: 150, // 150ms で消える
    });
  }
  
  private updateLightningBolts(delta: number): void {
    this.lightningBolts = this.lightningBolts.filter((bolt) => {
      bolt.lifetime += delta;
      return bolt.lifetime < bolt.maxLifetime;
    });
  }
  
  // ============================================
  // エフェクト描画
  // ============================================
  
  protected drawEffect(
    graphics: Phaser.GameObjects.Graphics,
    context: AbilityContext,
    progress: number
  ): void {
    const x = context.owner.x;
    const y = context.owner.y;
    const intensity = this.getIntensity(progress);
    
    // 電撃の範囲円を描画
    this.drawElectricField(graphics, x, y, intensity);
    
    // 雷を描画
    this.drawLightningBolts(graphics, x, y, intensity);
    
    // 中心の輝き
    this.drawCoreGlow(graphics, x, y, intensity);
  }
  
  private getIntensity(progress: number): number {
    // フェードイン・フェードアウト
    if (progress < 0.1) {
      return progress * 10;
    } else if (progress > 0.8) {
      return (1 - progress) * 5;
    }
    return 1;
  }
  
  private drawElectricField(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    intensity: number
  ): void {
    const time = Date.now() * 0.005;
    
    // 外側の電撃フィールド
    graphics.lineStyle(3, 0x00FFFF, 0.3 * intensity);
    graphics.strokeCircle(x, y, 75 + Math.sin(time) * 5);
    
    // 内側の電撃フィールド
    graphics.lineStyle(2, 0x00FFFF, 0.5 * intensity);
    graphics.strokeCircle(x, y, 50 + Math.sin(time * 1.5) * 3);
    
    // 最内側のフィールド
    graphics.lineStyle(2, 0xFFFFFF, 0.6 * intensity);
    graphics.strokeCircle(x, y, 25 + Math.sin(time * 2) * 2);
  }
  
  private drawLightningBolts(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    intensity: number
  ): void {
    this.lightningBolts.forEach((bolt) => {
      const alpha = 1 - (bolt.lifetime / bolt.maxLifetime);
      
      // メインの雷線
      graphics.lineStyle(3, 0x00FFFF, alpha * intensity);
      graphics.beginPath();
      
      bolt.segments.forEach((segment, index) => {
        if (index === 0) {
          graphics.moveTo(x + segment.x, y + segment.y);
        } else {
          graphics.lineTo(x + segment.x, y + segment.y);
        }
      });
      
      graphics.strokePath();
      
      // 光沢ライン（白）
      graphics.lineStyle(1.5, 0xFFFFFF, alpha * intensity * 0.8);
      graphics.beginPath();
      
      bolt.segments.forEach((segment, index) => {
        if (index === 0) {
          graphics.moveTo(x + segment.x, y + segment.y);
        } else {
          graphics.lineTo(x + segment.x, y + segment.y);
        }
      });
      
      graphics.strokePath();
    });
  }
  
  private drawCoreGlow(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    intensity: number
  ): void {
    const time = Date.now() * 0.01;
    const pulseSize = 15 + Math.sin(time) * 5;
    
    // 外側のグロー
    graphics.fillStyle(0x00FFFF, 0.3 * intensity);
    graphics.fillCircle(x, y, pulseSize + 10);
    
    // 内側のグロー
    graphics.fillStyle(0x88FFFF, 0.5 * intensity);
    graphics.fillCircle(x, y, pulseSize);
    
    // 中心の白い点
    graphics.fillStyle(0xFFFFFF, 0.8 * intensity);
    graphics.fillCircle(x, y, 8);
  }
  
  // ============================================
  // パーティクル管理
  // ============================================
  
  private createSparkParticles(context: AbilityContext): void {
    // 電撃パーティクルテクスチャを動的生成
    if (!context.scene.textures.exists('particle-spark')) {
      const graphics = context.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x00FFFF, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.fillCircle(4, 4, 2);
      graphics.generateTexture('particle-spark', 8, 8);
      graphics.destroy();
    }
    
    this.sparkParticles = context.scene.add.particles(
      context.owner.x,
      context.owner.y,
      'particle-spark',
      {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        lifespan: { min: 100, max: 300 },
        frequency: 30,
        blendMode: Phaser.BlendModes.ADD,
      }
    );
    this.sparkParticles.setDepth(14);
  }
  
  private updateSparkParticles(context: AbilityContext): void {
    if (!this.sparkParticles) return;
    
    this.sparkParticles.setPosition(context.owner.x, context.owner.y);
  }
  
  // ============================================
  // 衝突判定のオーバーライド（円形判定）
  // ============================================
  
  protected checkEnemyCollision(context: AbilityContext): void {
    const hitboxConfig = this.getHitboxConfig();
    const centerX = context.owner.x;
    const centerY = context.owner.y;
    const radius = hitboxConfig.radius || 80;
    
    context.enemies.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      
      const dx = enemy.x - centerX;
      const dy = enemy.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius) {
        this.onEnemyHit(context, enemy);
      }
    });
  }
  
  // ============================================
  // 敵ヒット時のオーバーライド
  // ============================================
  
  protected onEnemyHit(context: AbilityContext, enemy: Phaser.Physics.Arcade.Sprite): void {
    // 電撃エフェクト
    this.createElectricHitEffect(context, enemy.x, enemy.y);
    
    // 親クラスの処理
    super.onEnemyHit(context, enemy);
  }
  
  private createElectricHitEffect(context: AbilityContext, x: number, y: number): void {
    // 電撃の弾けるエフェクト
    const burst = context.scene.add.particles(x, y, 'particle-spark', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 20,
      blendMode: Phaser.BlendModes.ADD,
    });
    
    context.scene.time.delayedCall(500, () => burst.destroy());
    
    // 電撃リング
    const ring = context.scene.add.circle(x, y, 20, 0x00FFFF, 0.8);
    ring.setDepth(17);
    ring.setStrokeStyle(3, 0xFFFFFF);
    
    context.scene.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy(),
    });
  }
}
