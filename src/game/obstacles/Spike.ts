/**
 * Spike - トゲギミック
 * 
 * 触れるとカービィがダメージを受け、ノックバックする。
 */

import Phaser from 'phaser';
import type { SpikeConfig } from '../../types/game.types';

export class Spike {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public readonly config: SpikeConfig;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    config: SpikeConfig
  ) {
    this.config = config;
    
    // スプライト作成
    this.sprite = scene.physics.add.sprite(x, y, 'spike');
    this.sprite.setOrigin(0.5, 1); // 下端を基準点に
    this.sprite.setData('id', id);
    this.sprite.setData('type', 'SPIKE');
    this.sprite.setDepth(5);
    
    // 物理ボディ設定
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    
    // ヒットボックスを少し小さく（見た目より判定を甘く）
    body.setSize(24, 20);
    body.setOffset(4, 12);
  }
  
  public destroy(): void {
    this.sprite.destroy();
  }
}
