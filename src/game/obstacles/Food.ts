/**
 * Food - 回復アイテムギミック
 * 
 * 触れるとHPが回復し、消滅する。
 * りんご（1回復）、トマト（3回復）、マキシムトマト（全回復）の3種類。
 */

import Phaser from 'phaser';
import type { FoodConfig } from '../../types/game.types';

export class Food {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly config: FoodConfig;
  private readonly scene: Phaser.Scene;
  
  // 状態
  private _isActive = true;
  private floatTimer = 0;
  private readonly startY: number;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    config: FoodConfig
  ) {
    this.scene = scene;
    this.config = config;
    this.startY = y;
    
    // テクスチャ名を決定
    const textureKey = this.getTextureKey(config.type);
    
    // スプライト作成
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setData('id', id);
    this.sprite.setData('type', 'FOOD');
    this.sprite.setData('foodType', config.type);
    this.sprite.setDepth(6);
    
    // 物理ボディ設定
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    
    // マキシムトマトは輝きエフェクト
    if (config.type === 'MAXIM_TOMATO') {
      this.addGlowEffect();
    }
  }
  
  // ============================================
  // 更新処理
  // ============================================
  
  public update(delta: number): void {
    if (!this._isActive) return;
    
    // 上下に浮遊するアニメーション
    this.floatTimer += delta * 0.003;
    const floatOffset = Math.sin(this.floatTimer) * 4;
    this.sprite.y = this.startY + floatOffset;
    
    // マキシムトマトは回転
    if (this.config.type === 'MAXIM_TOMATO') {
      this.sprite.angle = Math.sin(this.floatTimer * 0.5) * 5;
    }
  }
  
  // ============================================
  // 取得処理
  // ============================================
  
  public collect(): void {
    if (!this._isActive) return;
    this._isActive = false;
    
    // 取得エフェクト
    this.createCollectEffect();
    
    // スプライトを非表示
    this.sprite.setVisible(false);
    this.sprite.body?.enable && (this.sprite.body.enable = false);
  }
  
  private createCollectEffect(): void {
    const { x, y } = this.sprite;
    
    // キラキラパーティクル
    if (!this.scene.textures.exists('particle-sparkle')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('particle-sparkle', 8, 8);
      graphics.destroy();
    }
    
    const particles = this.scene.add.particles(x, y, 'particle-sparkle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 10,
      tint: this.getParticleColor(),
    });
    
    this.scene.time.delayedCall(500, () => particles.destroy());
    
    // 回復量表示
    this.createHealText();
    
    // 拡大して消えるエフェクト
    const flash = this.scene.add.circle(x, y, 20, 0xFFFFFF, 0.8);
    flash.setDepth(10);
    
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }
  
  private createHealText(): void {
    const healAmount = this.config.healAmount;
    const text = healAmount >= 999 ? 'MAX!' : `+${healAmount}`;
    const color = healAmount >= 999 ? '#FFD700' : '#00FF00';
    
    const healText = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 20,
      text,
      {
        fontSize: healAmount >= 999 ? '20px' : '16px',
        fontFamily: 'Arial',
        color: color,
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    healText.setOrigin(0.5);
    healText.setDepth(20);
    
    this.scene.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => healText.destroy(),
    });
  }
  
  // ============================================
  // エフェクト
  // ============================================
  
  private addGlowEffect(): void {
    // マキシムトマトの周りに光の輪
    const glow = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      25,
      0xFFFF00,
      0.3
    );
    glow.setDepth(this.sprite.depth - 1);
    
    this.scene.tweens.add({
      targets: glow,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.3, to: 0.1 },
      duration: 800,
      repeat: -1,
      yoyo: true,
    });
    
    // spriteと一緒に移動
    this.scene.events.on('update', () => {
      if (this._isActive) {
        glow.setPosition(this.sprite.x, this.sprite.y);
      } else {
        glow.destroy();
      }
    });
  }
  
  // ============================================
  // ユーティリティ
  // ============================================
  
  private getTextureKey(type: string): string {
    switch (type) {
      case 'MAXIM_TOMATO':
        return 'food-maxim';
      case 'TOMATO':
        return 'food-tomato';
      case 'APPLE':
      default:
        return 'food-apple';
    }
  }
  
  private getParticleColor(): number {
    switch (this.config.type) {
      case 'MAXIM_TOMATO':
        return 0xFFD700; // ゴールド
      case 'TOMATO':
        return 0xFF6347; // トマトレッド
      case 'APPLE':
      default:
        return 0xFF0000; // 赤
    }
  }
  
  // ============================================
  // ゲッター
  // ============================================
  
  public get isActive(): boolean {
    return this._isActive;
  }
  
  // ============================================
  // クリーンアップ
  // ============================================
  
  public destroy(): void {
    this.sprite.destroy();
  }
}
