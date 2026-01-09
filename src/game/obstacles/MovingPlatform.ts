/**
 * MovingPlatform - 動く床ギミック
 * 
 * 2点間を往復する床。
 * カービィが上に乗った際、床の移動速度がカービィの座標に加算される。
 */

import Phaser from 'phaser';
import type { MovingPlatformConfig, PlatformPattern } from '../../types/game.types';

/** 移動方向 */
type MoveDirection = 'forward' | 'backward';

export class MovingPlatform {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly config: MovingPlatformConfig;
  
  // 移動状態
  private direction: MoveDirection = 'forward';
  private waitTimer = 0;
  private isWaiting = false;
  
  // 前フレームの座標（移動量計算用）
  private prevX: number;
  private prevY: number;
  
  // 移動補間用
  private progress = 0; // 0 = start, 1 = end
  
  constructor(
    scene: Phaser.Scene,
    id: string,
    config: MovingPlatformConfig
  ) {
    this.config = config;
    
    // 初期位置
    this.prevX = config.startX;
    this.prevY = config.startY;
    
    // スプライト作成
    this.sprite = scene.physics.add.sprite(
      config.startX,
      config.startY,
      'moving-platform'
    );
    this.sprite.setOrigin(0.5, 0);
    this.sprite.setData('id', id);
    this.sprite.setData('type', 'MOVING_PLATFORM');
    this.sprite.setDepth(4);
    
    // 物理ボディ設定
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    body.setFriction(1, 0);
    
    // 床のサイズに合わせてボディを調整
    body.setSize(96, 24);
    body.setOffset(0, 0);
  }
  
  // ============================================
  // 更新処理
  // ============================================
  
  public update(delta: number): void {
    // 前フレームの座標を保存
    this.prevX = this.sprite.x;
    this.prevY = this.sprite.y;
    
    if (this.isWaiting) {
      this.updateWaiting(delta);
    } else {
      this.updateMovement(delta);
    }
  }
  
  private updateWaiting(delta: number): void {
    this.waitTimer -= delta;
    
    if (this.waitTimer <= 0) {
      this.isWaiting = false;
      // 方向を反転
      this.direction = this.direction === 'forward' ? 'backward' : 'forward';
    }
  }
  
  private updateMovement(delta: number): void {
    const { startX, startY, endX, endY, speed, pattern } = this.config;
    
    // 移動距離を計算
    const totalDistance = this.calculateDistance(pattern, startX, startY, endX, endY);
    const moveAmount = (speed / totalDistance) * (delta / 1000);
    
    // 進捗を更新
    if (this.direction === 'forward') {
      this.progress += moveAmount;
      if (this.progress >= 1) {
        this.progress = 1;
        this.startWaiting();
      }
    } else {
      this.progress -= moveAmount;
      if (this.progress <= 0) {
        this.progress = 0;
        this.startWaiting();
      }
    }
    
    // 新しい座標を計算
    const newPos = this.calculatePosition(pattern, this.progress);
    this.sprite.setPosition(newPos.x, newPos.y);
  }
  
  private startWaiting(): void {
    this.isWaiting = true;
    this.waitTimer = this.config.waitTime ?? 500;
  }
  
  // ============================================
  // 座標計算
  // ============================================
  
  private calculateDistance(
    pattern: PlatformPattern,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): number {
    switch (pattern) {
      case 'CIRCULAR': {
        // 円運動の場合、半径を距離として使用
        const radius = Math.sqrt(
          Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        ) / 2;
        return Math.PI * 2 * radius;
      }
      case 'HORIZONTAL':
      case 'VERTICAL':
      default:
        return Math.sqrt(
          Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        );
    }
  }
  
  private calculatePosition(
    pattern: PlatformPattern,
    progress: number
  ): { x: number; y: number } {
    const { startX, startY, endX, endY } = this.config;
    
    switch (pattern) {
      case 'CIRCULAR': {
        // 円運動
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radius = Math.sqrt(
          Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        ) / 2;
        const angle = progress * Math.PI * 2;
        
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      }
      
      case 'HORIZONTAL':
      case 'VERTICAL':
      default: {
        // 線形補間（イージング適用）
        const easedProgress = this.easeInOutQuad(progress);
        
        return {
          x: startX + (endX - startX) * easedProgress,
          y: startY + (endY - startY) * easedProgress,
        };
      }
    }
  }
  
  /**
   * イージング関数（滑らかな加減速）
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  
  // ============================================
  // 移動量取得
  // ============================================
  
  /**
   * 前フレームからの移動量を取得
   * カービィが乗っている時に座標を加算するために使用
   */
  public getDeltaMovement(): { x: number; y: number } {
    return {
      x: this.sprite.x - this.prevX,
      y: this.sprite.y - this.prevY,
    };
  }
  
  /**
   * 現在の移動速度ベクトルを取得
   */
  public getVelocity(): { x: number; y: number } {
    const delta = this.getDeltaMovement();
    // 1フレームを約16msと仮定
    return {
      x: delta.x * 60,
      y: delta.y * 60,
    };
  }
  
  // ============================================
  // クリーンアップ
  // ============================================
  
  public destroy(): void {
    this.sprite.destroy();
  }
}
