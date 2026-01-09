/**
 * ObstacleManager - ギミック管理クラス
 * 
 * Tiledマップのオブジェクトレイヤーからギミックを読み込み、
 * Phaser上でスプライトとして生成・管理する。
 * 
 * 対応ギミック:
 * - トゲ (Spikes): ダメージ + ノックバック
 * - 動く床 (Moving Platform): 2点間往復
 * - 回復アイテム (Food): HP回復
 */

import Phaser from 'phaser';
import type {
  ObstacleType,
  MovingPlatformConfig,
  SpikeConfig,
  FoodConfig,
} from '../../types/game.types';
import { MovingPlatform } from './MovingPlatform';
import { Spike } from './Spike';
import { Food } from './Food';

// ============================================
// 型定義
// ============================================

/** Tiledオブジェクトレイヤーからの読み込みデータ */
export interface TiledObjectData {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: { name: string; value: unknown }[];
}

/** ギミック生成の設定 */
export interface ObstacleSpawnConfig {
  type: ObstacleType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  properties?: Record<string, unknown>;
}

/** コールバック型定義 */
export interface ObstacleCallbacks {
  onDamage?: (damage: number, knockbackX: number, knockbackY: number) => void;
  onHeal?: (amount: number) => void;
  onPlatformContact?: (platform: MovingPlatform) => void;
}

// ============================================
// ObstacleManager クラス
// ============================================

export class ObstacleManager {
  private scene: Phaser.Scene;
  
  // ギミックグループ
  private spikes: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms: Phaser.Physics.Arcade.Group;
  private foods: Phaser.Physics.Arcade.Group;
  
  // ギミックインスタンス管理
  private spikeInstances: Map<string, Spike> = new Map();
  private platformInstances: Map<string, MovingPlatform> = new Map();
  private foodInstances: Map<string, Food> = new Map();
  
  // コールバック
  private callbacks: ObstacleCallbacks = {};
  
  // 無敵時間管理
  private isInvincible = false;
  private invincibleTimer = 0;
  private readonly INVINCIBLE_DURATION = 1500; // 1.5秒
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // グループ初期化
    this.spikes = scene.physics.add.staticGroup();
    this.movingPlatforms = scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.foods = scene.physics.add.group({
      allowGravity: false,
    });
  }
  
  // ============================================
  // 初期化
  // ============================================
  
  /**
   * テクスチャを生成
   */
  public createTextures(): void {
    this.createSpikeTexture();
    this.createPlatformTexture();
    this.createFoodTextures();
  }
  
  private createSpikeTexture(): void {
    if (this.scene.textures.exists('spike')) return;
    
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    const size = 32;
    
    // トゲの三角形
    graphics.fillStyle(0x666666, 1);
    graphics.beginPath();
    graphics.moveTo(0, size);
    graphics.lineTo(size / 2, 0);
    graphics.lineTo(size, size);
    graphics.closePath();
    graphics.fillPath();
    
    // ハイライト
    graphics.fillStyle(0x888888, 1);
    graphics.beginPath();
    graphics.moveTo(size / 2 - 2, 8);
    graphics.lineTo(size / 2, 0);
    graphics.lineTo(size / 2 + 2, 8);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.generateTexture('spike', size, size);
    graphics.destroy();
  }
  
  private createPlatformTexture(): void {
    if (this.scene.textures.exists('moving-platform')) return;
    
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    const width = 96;
    const height = 24;
    
    // メインの床部分
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 上面のハイライト
    graphics.fillStyle(0xA0522D, 1);
    graphics.fillRect(0, 0, width, 6);
    
    // ピクセル風のディテール
    graphics.fillStyle(0x6B3510, 1);
    for (let i = 0; i < 4; i++) {
      const x = 8 + i * 24;
      graphics.fillRect(x, 10, 4, 4);
    }
    
    // 左右の縁
    graphics.fillStyle(0x5D3A1A, 1);
    graphics.fillRect(0, 0, 4, height);
    graphics.fillRect(width - 4, 0, 4, height);
    
    graphics.generateTexture('moving-platform', width, height);
    graphics.destroy();
  }
  
  private createFoodTextures(): void {
    // りんご
    if (!this.scene.textures.exists('food-apple')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      const size = 24;
      
      // りんご本体
      graphics.fillStyle(0xFF0000, 1);
      graphics.fillCircle(size / 2, size / 2 + 2, 10);
      
      // ハイライト
      graphics.fillStyle(0xFF6666, 1);
      graphics.fillCircle(size / 2 - 3, size / 2 - 1, 3);
      
      // 茎
      graphics.fillStyle(0x8B4513, 1);
      graphics.fillRect(size / 2 - 1, 0, 3, 6);
      
      // 葉
      graphics.fillStyle(0x228B22, 1);
      graphics.fillEllipse(size / 2 + 5, 4, 6, 4);
      
      graphics.generateTexture('food-apple', size, size);
      graphics.destroy();
    }
    
    // トマト（中回復）
    if (!this.scene.textures.exists('food-tomato')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      const size = 28;
      
      graphics.fillStyle(0xFF4500, 1);
      graphics.fillCircle(size / 2, size / 2 + 2, 12);
      
      graphics.fillStyle(0xFF6347, 1);
      graphics.fillCircle(size / 2 - 4, size / 2, 4);
      
      // ヘタ
      graphics.fillStyle(0x228B22, 1);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + Math.cos(angle) * 6;
        const y = 4 + Math.sin(angle) * 3;
        graphics.fillEllipse(x, y, 5, 3);
      }
      
      graphics.generateTexture('food-tomato', size, size);
      graphics.destroy();
    }
    
    // マキシムトマト（全回復）
    if (!this.scene.textures.exists('food-maxim')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      const size = 36;
      
      // 大きなトマト
      graphics.fillStyle(0xFF0000, 1);
      graphics.fillCircle(size / 2, size / 2 + 2, 15);
      
      graphics.fillStyle(0xFF4444, 1);
      graphics.fillCircle(size / 2 - 5, size / 2 - 2, 5);
      
      // M マーク
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.lineStyle(2, 0xFFFFFF, 1);
      graphics.beginPath();
      graphics.moveTo(size / 2 - 6, size / 2 + 6);
      graphics.lineTo(size / 2 - 6, size / 2 - 2);
      graphics.lineTo(size / 2, size / 2 + 2);
      graphics.lineTo(size / 2 + 6, size / 2 - 2);
      graphics.lineTo(size / 2 + 6, size / 2 + 6);
      graphics.strokePath();
      
      // ヘタ
      graphics.fillStyle(0x228B22, 1);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + Math.cos(angle) * 8;
        const y = 5 + Math.sin(angle) * 4;
        graphics.fillEllipse(x, y, 6, 4);
      }
      
      graphics.generateTexture('food-maxim', size, size);
      graphics.destroy();
    }
  }
  
  // ============================================
  // Tiledマップからの読み込み
  // ============================================
  
  /**
   * Tiledのオブジェクトレイヤーからギミックを読み込む
   */
  public loadFromTilemap(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string
  ): void {
    const objectLayer = map.getObjectLayer(layerName);
    if (!objectLayer) {
      console.warn(`Object layer "${layerName}" not found in tilemap`);
      return;
    }
    
    objectLayer.objects.forEach((obj) => {
      const type = this.parseObstacleType(obj.type || obj.name);
      if (!type) return;
      
      const properties = this.parseProperties(obj.properties as { name: string; value: unknown }[]);
      
      this.spawnObstacle({
        type,
        x: obj.x ?? 0,
        y: obj.y ?? 0,
        width: obj.width,
        height: obj.height,
        properties,
      });
    });
  }
  
  /**
   * 手動でギミックを配置
   */
  public spawnObstacle(config: ObstacleSpawnConfig): void {
    const id = `obstacle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch (config.type) {
      case 'SPIKE':
        this.createSpike(id, config);
        break;
      case 'MOVING_PLATFORM':
        this.createMovingPlatform(id, config);
        break;
      case 'FOOD':
        this.createFood(id, config);
        break;
    }
  }
  
  // ============================================
  // ギミック生成
  // ============================================
  
  private createSpike(id: string, config: ObstacleSpawnConfig): void {
    const spikeConfig: SpikeConfig = {
      damage: (config.properties?.damage as number) ?? 1,
      knockbackForce: (config.properties?.knockback as number) ?? 300,
    };
    
    const spike = new Spike(
      this.scene,
      config.x,
      config.y,
      id,
      spikeConfig
    );
    
    this.spikes.add(spike.sprite);
    this.spikeInstances.set(id, spike);
  }
  
  private createMovingPlatform(id: string, config: ObstacleSpawnConfig): void {
    const platformConfig: MovingPlatformConfig = {
      pattern: (config.properties?.pattern as 'HORIZONTAL' | 'VERTICAL') ?? 'HORIZONTAL',
      startX: config.x,
      startY: config.y,
      endX: (config.properties?.endX as number) ?? config.x + 200,
      endY: (config.properties?.endY as number) ?? config.y,
      speed: (config.properties?.speed as number) ?? 100,
      waitTime: (config.properties?.waitTime as number) ?? 500,
    };
    
    const platform = new MovingPlatform(
      this.scene,
      id,
      platformConfig
    );
    
    this.movingPlatforms.add(platform.sprite);
    this.platformInstances.set(id, platform);
  }
  
  private createFood(id: string, config: ObstacleSpawnConfig): void {
    const foodType = (config.properties?.foodType as string) ?? 'APPLE';
    const foodConfig: FoodConfig = {
      type: foodType as 'APPLE' | 'TOMATO' | 'MAXIM_TOMATO',
      healAmount: this.getFoodHealAmount(foodType),
    };
    
    const food = new Food(
      this.scene,
      config.x,
      config.y,
      id,
      foodConfig
    );
    
    this.foods.add(food.sprite);
    this.foodInstances.set(id, food);
  }
  
  private getFoodHealAmount(type: string): number {
    switch (type) {
      case 'MAXIM_TOMATO': return 999; // 全回復
      case 'TOMATO': return 3;
      case 'APPLE':
      default: return 1;
    }
  }
  
  // ============================================
  // コリジョン設定
  // ============================================
  
  /**
   * カービィとのコリジョンを設定
   */
  public setupCollisions(
    kirby: Phaser.Physics.Arcade.Sprite,
    callbacks: ObstacleCallbacks
  ): void {
    this.callbacks = callbacks;
    
    // トゲとの衝突
    this.scene.physics.add.overlap(
      kirby,
      this.spikes,
      (_, spikeObj) => this.handleSpikeCollision(kirby, spikeObj as Phaser.Physics.Arcade.Sprite),
      undefined,
      this
    );
    
    // 動く床との衝突（上から乗った時のみ）
    this.scene.physics.add.collider(
      kirby,
      this.movingPlatforms,
      (_, platformObj) => this.handlePlatformCollision(kirby, platformObj as Phaser.Physics.Arcade.Sprite),
      (kirbyObj, platformObj) => this.platformCollisionProcess(kirbyObj as Phaser.Physics.Arcade.Sprite, platformObj as Phaser.Physics.Arcade.Sprite),
      this
    );
    
    // 回復アイテムとの衝突
    this.scene.physics.add.overlap(
      kirby,
      this.foods,
      (_, foodObj) => this.handleFoodCollision(foodObj as Phaser.Physics.Arcade.Sprite),
      undefined,
      this
    );
  }
  
  /**
   * 地面グループとのコリジョン設定（動く床用）
   */
  public setupPlatformGroundCollision(_ground: Phaser.Physics.Arcade.StaticGroup): void {
    // 動く床は地面と衝突しない（すり抜ける）
  }
  
  // ============================================
  // コリジョンハンドラー
  // ============================================
  
  private handleSpikeCollision(
    kirby: Phaser.Physics.Arcade.Sprite,
    spikeSprite: Phaser.Physics.Arcade.Sprite
  ): void {
    if (this.isInvincible) return;
    
    const spikeId = spikeSprite.getData('id') as string;
    const spike = this.spikeInstances.get(spikeId);
    if (!spike) return;
    
    // ダメージ計算
    const config = spike.config;
    const knockbackX = kirby.x < spikeSprite.x 
      ? -config.knockbackForce 
      : config.knockbackForce;
    
    // 無敵時間開始
    this.startInvincibility(kirby);
    
    // コールバック呼び出し
    if (this.callbacks.onDamage) {
      this.callbacks.onDamage(config.damage, knockbackX, -200);
    }
  }
  
  private handlePlatformCollision(
    _kirby: Phaser.Physics.Arcade.Sprite,
    platformSprite: Phaser.Physics.Arcade.Sprite
  ): void {
    const platformId = platformSprite.getData('id') as string;
    const platform = this.platformInstances.get(platformId);
    if (!platform) return;
    
    if (this.callbacks.onPlatformContact) {
      this.callbacks.onPlatformContact(platform);
    }
  }
  
  /**
   * プラットフォームコリジョンの判定処理
   * 上から乗った時のみ衝突を許可
   */
  private platformCollisionProcess(
    kirby: Phaser.Physics.Arcade.Sprite,
    platform: Phaser.Physics.Arcade.Sprite
  ): boolean {
    const kirbyBody = kirby.body as Phaser.Physics.Arcade.Body;
    const platformBody = platform.body as Phaser.Physics.Arcade.Body;
    
    // カービィが落下中で、足元がプラットフォームの上面にある場合のみ衝突
    return kirbyBody.velocity.y >= 0 && 
           kirbyBody.bottom <= platformBody.top + 10;
  }
  
  private handleFoodCollision(foodSprite: Phaser.Physics.Arcade.Sprite): void {
    const foodId = foodSprite.getData('id') as string;
    const food = this.foodInstances.get(foodId);
    if (!food || !food.isActive) return;
    
    // 回復処理
    food.collect();
    
    if (this.callbacks.onHeal) {
      this.callbacks.onHeal(food.config.healAmount);
    }
    
    // 削除
    this.foods.remove(foodSprite, true, true);
    this.foodInstances.delete(foodId);
  }
  
  // ============================================
  // 無敵時間処理
  // ============================================
  
  private startInvincibility(kirby: Phaser.Physics.Arcade.Sprite): void {
    this.isInvincible = true;
    this.invincibleTimer = this.INVINCIBLE_DURATION;
    
    // 点滅エフェクト
    this.scene.tweens.add({
      targets: kirby,
      alpha: { from: 1, to: 0.3 },
      duration: 100,
      repeat: Math.floor(this.INVINCIBLE_DURATION / 200),
      yoyo: true,
      onComplete: () => {
        kirby.setAlpha(1);
      },
    });
  }
  
  // ============================================
  // 更新処理
  // ============================================
  
  /**
   * 毎フレーム呼び出し
   */
  public update(delta: number, kirby: Phaser.Physics.Arcade.Sprite): void {
    // 無敵時間更新
    if (this.isInvincible) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }
    
    // 動く床の更新
    this.platformInstances.forEach((platform) => {
      platform.update(delta);
    });
    
    // 動く床に乗っている場合の座標補正
    this.applyPlatformMovement(kirby);
    
    // 回復アイテムのアニメーション
    this.foodInstances.forEach((food) => {
      food.update(delta);
    });
  }
  
  /**
   * カービィが動く床に乗っている場合、床の移動量を加算
   */
  private applyPlatformMovement(kirby: Phaser.Physics.Arcade.Sprite): void {
    const kirbyBody = kirby.body as Phaser.Physics.Arcade.Body;
    if (!kirbyBody.blocked.down) return;
    
    // カービィの足元にあるプラットフォームを探す
    this.platformInstances.forEach((platform) => {
      const platformSprite = platform.sprite;
      const platformBody = platformSprite.body as Phaser.Physics.Arcade.Body;
      
      // カービィがプラットフォームの上にいるかチェック
      const isOnPlatform = 
        kirbyBody.bottom >= platformBody.top - 2 &&
        kirbyBody.bottom <= platformBody.top + 10 &&
        kirbyBody.right > platformBody.left &&
        kirbyBody.left < platformBody.right;
      
      if (isOnPlatform) {
        // プラットフォームの移動量をカービィに適用
        const deltaMovement = platform.getDeltaMovement();
        kirby.x += deltaMovement.x;
        kirby.y += deltaMovement.y;
      }
    });
  }
  
  // ============================================
  // ユーティリティ
  // ============================================
  
  private parseObstacleType(typeString: string): ObstacleType | null {
    const typeMap: Record<string, ObstacleType> = {
      'spike': 'SPIKE',
      'spikes': 'SPIKE',
      'moving_platform': 'MOVING_PLATFORM',
      'movingplatform': 'MOVING_PLATFORM',
      'platform': 'MOVING_PLATFORM',
      'food': 'FOOD',
      'item': 'FOOD',
    };
    
    return typeMap[typeString.toLowerCase()] || null;
  }
  
  private parseProperties(
    props?: { name: string; value: unknown }[]
  ): Record<string, unknown> {
    if (!props) return {};
    
    const result: Record<string, unknown> = {};
    props.forEach((prop) => {
      result[prop.name] = prop.value;
    });
    return result;
  }
  
  // ============================================
  // ゲッター
  // ============================================
  
  public get spikeGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.spikes;
  }
  
  public get platformGroup(): Phaser.Physics.Arcade.Group {
    return this.movingPlatforms;
  }
  
  public get foodGroup(): Phaser.Physics.Arcade.Group {
    return this.foods;
  }
  
  public get invincible(): boolean {
    return this.isInvincible;
  }
  
  // ============================================
  // クリーンアップ
  // ============================================
  
  public destroy(): void {
    this.spikeInstances.forEach((spike) => spike.destroy());
    this.platformInstances.forEach((platform) => platform.destroy());
    this.foodInstances.forEach((food) => food.destroy());
    
    this.spikeInstances.clear();
    this.platformInstances.clear();
    this.foodInstances.clear();
    
    this.spikes.destroy(true);
    this.movingPlatforms.destroy(true);
    this.foods.destroy(true);
  }
}
