/**
 * ShockWave - 衝撃波クラス
 * 
 * ボスの着地時に左右に広がる星型の衝撃波。
 * 一定距離を進むと消滅する。
 */

import Phaser from 'phaser';

export type ShockWaveDirection = 'left' | 'right';

export interface ShockWaveConfig {
  speed: number;          // 移動速度
  maxDistance: number;    // 最大移動距離
  damage: number;         // ダメージ量
  size: number;           // サイズ
}

export const DEFAULT_SHOCKWAVE_CONFIG: ShockWaveConfig = {
  speed: 350,
  maxDistance: 300,
  damage: 1,
  size: 24,
};

export class ShockWave {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly scene: Phaser.Scene;
  private readonly config: ShockWaveConfig;
  
  // 開始位置（消滅判定用）
  private readonly startX: number;
  
  // アニメーション
  private rotation = 0;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: ShockWaveDirection,
    config: ShockWaveConfig = DEFAULT_SHOCKWAVE_CONFIG
  ) {
    this.scene = scene;
    this.config = config;
    this.startX = x;
    
    // スプライト作成
    this.sprite = scene.physics.add.sprite(x, y - 16, 'shockwave-star');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(8);
    this.sprite.setData('type', 'SHOCKWAVE');
    this.sprite.setData('damage', config.damage);
    
    // 物理ボディ設定
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(config.size, config.size);
    
    // 移動速度設定
    const velocityX = direction === 'left' ? -config.speed : config.speed;
    body.setVelocityX(velocityX);
    
    // 少しバウンドするような動き
    body.setVelocityY(-100);
    body.setGravityY(200);
  }
  
  // ============================================
  // 更新
  // ============================================
  
  update(): void {
    // 回転アニメーション
    this.rotation += 0.15;
    this.sprite.setRotation(this.rotation);
    
    // スケール変動でキラキラ感
    const scale = 1 + Math.sin(this.rotation * 2) * 0.1;
    this.sprite.setScale(scale);
  }
  
  // ============================================
  // 消滅判定
  // ============================================
  
  shouldDestroy(): boolean {
    const distance = Math.abs(this.sprite.x - this.startX);
    return distance >= this.config.maxDistance;
  }
  
  // ============================================
  // ダメージ取得
  // ============================================
  
  getDamage(): number {
    return this.config.damage;
  }
  
  // ============================================
  // クリーンアップ
  // ============================================
  
  destroy(): void {
    // 消滅エフェクト
    this.createDestroyEffect();
    this.sprite.destroy();
  }
  
  private createDestroyEffect(): void {
    const particles = this.scene.add.particles(
      this.sprite.x,
      this.sprite.y,
      'shockwave-star',
      {
        speed: { min: 50, max: 150 },
        scale: { start: 0.5, end: 0 },
        lifespan: 300,
        quantity: 5,
        emitting: false,
      }
    );
    
    particles.explode();
    
    // 自動削除
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }
}
