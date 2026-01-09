/**
 * メインゲームシーン（改良版）
 * ピクセルアートキャラクター、物理挙動、吸い込みロジック、コピー能力を統合
 */

import Phaser from 'phaser';
import type {
  KirbyState,
  PhysicsConfig,
  InhaleArea,
  EnemyType,
  CopyAbility,
} from '../../types/game.types';
import {
  DEFAULT_PHYSICS_CONFIG,
  DEFAULT_INHALE_AREA,
} from '../../types/game.types';
import {
  getGameInput,
  getGameActions,
  getKirbyData,
} from '../../store/gameStore';
import { createPixelArtTexture } from '../utils/pixelArt';
import { KIRBY_SPRITES } from '../sprites/kirbySprites';
import { WADDLE_DEE_SPRITES } from '../sprites/waddleDeeSprites';
import {
  createAbility,
  getAbilityColor,
  type BaseAbility,
  type AbilityContext,
} from '../abilities';
import { ObstacleManager } from '../obstacles';

// 敵のスポーン設定
interface EnemySpawnConfig {
  x: number;
  y: number;
  type: EnemyType;
  patrolRange?: number;
}

export class MainScene extends Phaser.Scene {
  // カービィのスプライト
  private kirby!: Phaser.Physics.Arcade.Sprite;
  
  // プラットフォーム（地面）
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  
  // 敵グループ
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  
  // 吸い込みエリアのグラフィック
  private inhaleGraphics!: Phaser.GameObjects.Graphics;
  
  // キーボード入力
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private actionKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;
  
  // 物理設定
  private physicsConfig: PhysicsConfig = DEFAULT_PHYSICS_CONFIG;
  private inhaleConfig: InhaleArea = DEFAULT_INHALE_AREA;
  
  // 入力状態追跡
  private wasJumpPressed = false;
  private wasActionPressed = false;
  
  // アニメーション用タイマー
  private walkAnimTimer = 0;
  private walkAnimFrame = 0;
  private enemyAnimTimers: Map<string, number> = new Map();
  
  // ホバリング用パーティクル
  private hoverParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  // コピー能力システム
  private currentAbility: BaseAbility | null = null;
  private kirbyTintColor: number | null = null;
  
  // ギミック管理
  private obstacleManager!: ObstacleManager;
  
  constructor() {
    super({ key: 'MainScene' });
  }
  
  preload(): void {
    // ピクセルアートテクスチャを生成
    this.createPixelArtTextures();
    
    // ギミック管理初期化
    this.obstacleManager = new ObstacleManager(this);
    this.obstacleManager.createTextures();
  }
  
  create(): void {
    // 背景
    this.createBackground();
    
    // プラットフォーム作成
    this.createPlatforms();
    
    // カービィ作成
    this.createKirby();
    
    // 吸い込みエリア表示用グラフィック
    this.inhaleGraphics = this.add.graphics();
    this.inhaleGraphics.setDepth(5);
    
    // パーティクルシステム
    this.createParticleSystems();
    
    // 敵グループ作成
    this.enemyGroup = this.physics.add.group();
    
    // コリジョン設定
    this.physics.add.collider(this.kirby, this.platforms);
    this.physics.add.collider(this.enemyGroup, this.platforms);
    
    // キーボード入力設定
    this.setupKeyboardInput();
    
    // 敵を配置
    this.spawnEnemies();
    
    // ギミックを配置
    this.spawnObstacles();
    
    // カメラ設定
    this.cameras.main.startFollow(this.kirby, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);
    
    // ゲーム開始
    getGameActions().setKirbyState('IDLE');
  }
  
  update(_time: number, delta: number): void {
    if (!this.kirby || !this.kirby.body) return;
    
    // 入力を統合（キーボード + バーチャルパッド）
    const input = this.getUnifiedInput();
    
    // 地面判定を更新
    const isOnGround = this.kirby.body.blocked.down;
    const actions = getGameActions();
    actions.setKirbyOnGround(isOnGround);
    
    // カービィの状態に応じた処理
    const kirbyData = getKirbyData();
    
    // コピー能力の同期チェック
    this.syncCopyAbility(kirbyData.copyAbility);
    
    // コピー能力を持っている場合はアクションボタンで能力発動
    if (kirbyData.copyAbility !== 'NONE' && kirbyData.state !== 'FULL') {
      this.handleAbilityAction(input, kirbyData, delta);
    } else if (input.action && kirbyData.state !== 'FULL') {
      // 能力がない場合は吸い込み処理
      this.handleInhale(delta);
    } else {
      this.inhaleGraphics.clear();
      if (kirbyData.state === 'INHALING') {
        actions.setKirbyState(isOnGround ? 'IDLE' : 'FALLING');
      }
    }
    
    // コピー能力の更新
    this.updateAbility(delta, kirbyData);
    
    // 移動処理
    this.handleMovement(input, kirbyData.state);
    
    // ジャンプ/ホバリング処理
    this.handleJumpAndHover(input, isOnGround, kirbyData, delta);
    
    // 頬張り状態のアクション
    if (kirbyData.state === 'FULL') {
      this.handleFullState(input);
    }
    
    // 敵のAI更新
    this.updateEnemies(delta);
    
    // ギミック更新
    this.obstacleManager.update(delta, this.kirby);
    
    // アニメーション更新
    this.updateAnimations(delta, kirbyData.state);
    
    // パーティクル更新
    this.updateParticles(kirbyData.state);
    
    // カービィの色更新
    this.updateKirbyTint(kirbyData);
    
    // 入力状態を次フレーム用に保存
    this.wasJumpPressed = input.jump;
    this.wasActionPressed = input.action;
  }
  
  // ============================================
  // テクスチャ生成
  // ============================================
  
  private createPixelArtTextures(): void {
    const pixelSize = 3; // 各ピクセルのサイズ
    
    // カービィのテクスチャ
    createPixelArtTexture(this, 'kirby-idle', KIRBY_SPRITES.idle, pixelSize);
    createPixelArtTexture(this, 'kirby-walk1', KIRBY_SPRITES.walk1, pixelSize);
    createPixelArtTexture(this, 'kirby-walk2', KIRBY_SPRITES.walk2, pixelSize);
    createPixelArtTexture(this, 'kirby-jump', KIRBY_SPRITES.jump, pixelSize);
    createPixelArtTexture(this, 'kirby-hover', KIRBY_SPRITES.hover, pixelSize);
    createPixelArtTexture(this, 'kirby-full', KIRBY_SPRITES.full, pixelSize);
    createPixelArtTexture(this, 'kirby-inhale', KIRBY_SPRITES.inhale, pixelSize);
    
    // ワドルディのテクスチャ
    createPixelArtTexture(this, 'waddle-idle', WADDLE_DEE_SPRITES.idle, pixelSize);
    createPixelArtTexture(this, 'waddle-walk1', WADDLE_DEE_SPRITES.walk1, pixelSize);
    createPixelArtTexture(this, 'waddle-walk2', WADDLE_DEE_SPRITES.walk2, pixelSize);
    createPixelArtTexture(this, 'waddle-inhaled', WADDLE_DEE_SPRITES.inhaled, pixelSize);
    createPixelArtTexture(this, 'waddle-fire', WADDLE_DEE_SPRITES.fire, pixelSize);
    createPixelArtTexture(this, 'waddle-ice', WADDLE_DEE_SPRITES.ice, pixelSize);
    
    // 地面テクスチャ（マインクラフト風）
    this.createGroundTexture();
    
    // 星弾テクスチャ
    this.createStarTexture();
    
    // パーティクル用テクスチャ
    this.createParticleTextures();
  }
  
  private createGroundTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const tileSize = 32;
    
    // 草ブロック（上面が緑、側面が茶色）
    graphics.fillStyle(0x5D8C3E, 1);
    graphics.fillRect(0, 0, tileSize, 8);
    
    graphics.fillStyle(0x8B5A2B, 1);
    graphics.fillRect(0, 8, tileSize, tileSize - 8);
    
    // ピクセル風のディテール
    graphics.fillStyle(0x4A7030, 1);
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(Math.random() * tileSize);
      graphics.fillRect(x, 0, 2, 2);
    }
    
    graphics.fillStyle(0x6B4423, 1);
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = 10 + Math.floor(Math.random() * (tileSize - 12));
      graphics.fillRect(x, y, 2, 2);
    }
    
    graphics.generateTexture('ground', tileSize, tileSize);
    graphics.destroy();
    
    // 土のみブロック
    const dirtGraphics = this.make.graphics({ x: 0, y: 0 });
    dirtGraphics.fillStyle(0x8B5A2B, 1);
    dirtGraphics.fillRect(0, 0, tileSize, tileSize);
    
    dirtGraphics.fillStyle(0x6B4423, 1);
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      dirtGraphics.fillRect(x, y, 2, 2);
    }
    
    dirtGraphics.generateTexture('dirt', tileSize, tileSize);
    dirtGraphics.destroy();
  }
  
  private createStarTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 24;
    
    graphics.fillStyle(0xFFFF00, 1);
    
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size / 2 - 2;
    const innerRadius = outerRadius * 0.4;
    const points = 5;
    
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    
    graphics.fillStyle(0xFFFFCC, 1);
    graphics.fillCircle(cx - 3, cy - 3, 3);
    
    graphics.generateTexture('star', size, size);
    graphics.destroy();
  }
  
  private createParticleTextures(): void {
    const inhaleGraphics = this.make.graphics({ x: 0, y: 0 });
    inhaleGraphics.fillStyle(0x87CEEB, 1);
    inhaleGraphics.fillCircle(4, 4, 4);
    inhaleGraphics.generateTexture('particle-inhale', 8, 8);
    inhaleGraphics.destroy();
    
    const hoverGraphics = this.make.graphics({ x: 0, y: 0 });
    hoverGraphics.fillStyle(0xFFFFFF, 0.7);
    hoverGraphics.fillCircle(6, 6, 6);
    hoverGraphics.generateTexture('particle-hover', 12, 12);
    hoverGraphics.destroy();
  }
  
  // ============================================
  // 背景とプラットフォーム
  // ============================================
  
  private createBackground(): void {
    const width = 1600;
    const height = this.scale.height;
    
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
    sky.fillRect(0, 0, width, height);
    sky.setScrollFactor(0.5);
    
    for (let i = 0; i < 8; i++) {
      this.createCloud(
        100 + Math.random() * (width - 200),
        50 + Math.random() * 150
      );
    }
    
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
  }
  
  private createCloud(x: number, y: number): void {
    const cloud = this.add.graphics();
    cloud.fillStyle(0xFFFFFF, 0.8);
    
    cloud.fillCircle(0, 0, 30);
    cloud.fillCircle(25, -5, 25);
    cloud.fillCircle(50, 0, 30);
    cloud.fillCircle(25, 10, 20);
    
    cloud.setPosition(x, y);
    cloud.setScrollFactor(0.3);
    cloud.setDepth(-1);
  }
  
  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    
    const gameWidth = 1600;
    const gameHeight = this.scale.height;
    
    for (let x = 0; x < gameWidth; x += 32) {
      this.platforms.create(x + 16, gameHeight - 16, 'ground');
      this.platforms.create(x + 16, gameHeight - 16 + 32, 'dirt');
    }
    
    const platformConfigs = [
      { x: 200, y: gameHeight - 120, width: 3 },
      { x: 400, y: gameHeight - 180, width: 4 },
      { x: 650, y: gameHeight - 120, width: 3 },
      { x: 900, y: gameHeight - 200, width: 5 },
      { x: 1150, y: gameHeight - 150, width: 3 },
      { x: 1350, y: gameHeight - 220, width: 4 },
    ];
    
    platformConfigs.forEach(config => {
      for (let i = 0; i < config.width; i++) {
        this.platforms.create(config.x + i * 32, config.y, 'ground');
      }
    });
  }
  
  // ============================================
  // カービィの作成
  // ============================================
  
  private createKirby(): void {
    const gameHeight = this.scale.height;
    
    this.kirby = this.physics.add.sprite(100, gameHeight - 100, 'kirby-idle');
    this.kirby.setCollideWorldBounds(true);
    this.kirby.setBounce(0);
    this.kirby.setGravityY(this.physicsConfig.gravity);
    this.kirby.setDepth(10);
    
    const body = this.kirby.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 44);
    body.setOffset(4, 4);
  }
  
  // ============================================
  // パーティクルシステム
  // ============================================
  
  private createParticleSystems(): void {
    this.hoverParticles = this.add.particles(0, 0, 'particle-hover', {
      speed: { min: 50, max: 100 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      frequency: 100,
      emitting: false,
    });
    this.hoverParticles.setDepth(9);
  }
  
  // ============================================
  // 敵の生成とAI
  // ============================================
  
  private spawnEnemies(): void {
    const gameHeight = this.scale.height;
    const actions = getGameActions();
    
    const enemyConfigs: EnemySpawnConfig[] = [
      { x: 300, y: gameHeight - 80, type: 'NORMAL', patrolRange: 100 },
      { x: 500, y: gameHeight - 80, type: 'NORMAL', patrolRange: 80 },
      { x: 420, y: gameHeight - 230, type: 'FIRE', patrolRange: 60 },
      { x: 920, y: gameHeight - 250, type: 'ICE', patrolRange: 80 },
      { x: 700, y: gameHeight - 80, type: 'NORMAL', patrolRange: 120 },
      { x: 1000, y: gameHeight - 80, type: 'FIRE', patrolRange: 100 },
      { x: 1200, y: gameHeight - 80, type: 'NORMAL', patrolRange: 80 },
      { x: 1370, y: gameHeight - 270, type: 'ICE', patrolRange: 60 },
    ];
    
    enemyConfigs.forEach((config, index) => {
      const textureKey = this.getEnemyTexture(config.type);
      const enemy = this.enemyGroup.create(
        config.x,
        config.y,
        textureKey
      ) as Phaser.Physics.Arcade.Sprite;
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      enemy.setGravityY(600);
      enemy.setDepth(8);
      
      enemy.setData('id', `enemy-${index}`);
      enemy.setData('type', config.type);
      enemy.setData('startX', config.x);
      enemy.setData('patrolRange', config.patrolRange || 100);
      enemy.setData('direction', 1);
      enemy.setData('isBeingInhaled', false);
      
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setSize(40, 44);
      body.setOffset(4, 4);
      
      actions.addEnemy({
        id: `enemy-${index}`,
        type: config.type,
        x: config.x,
        y: config.y,
        isBeingInhaled: false,
        health: 1,
      });
      
      this.enemyAnimTimers.set(`enemy-${index}`, 0);
    });
  }
  
  /**
   * ギミックの配置
   */
  private spawnObstacles(): void {
    const gameHeight = this.scale.height;
    
    // トゲを配置
    this.obstacleManager.spawnObstacle({
      type: 'SPIKE',
      x: 550,
      y: gameHeight - 32,
      properties: { damage: 1, knockback: 300 },
    });
    this.obstacleManager.spawnObstacle({
      type: 'SPIKE',
      x: 582,
      y: gameHeight - 32,
      properties: { damage: 1, knockback: 300 },
    });
    this.obstacleManager.spawnObstacle({
      type: 'SPIKE',
      x: 614,
      y: gameHeight - 32,
      properties: { damage: 1, knockback: 300 },
    });
    
    // 動く床を配置（水平移動）
    this.obstacleManager.spawnObstacle({
      type: 'MOVING_PLATFORM',
      x: 750,
      y: gameHeight - 150,
      properties: {
        pattern: 'HORIZONTAL',
        endX: 950,
        endY: gameHeight - 150,
        speed: 80,
        waitTime: 500,
      },
    });
    
    // 動く床を配置（垂直移動）
    this.obstacleManager.spawnObstacle({
      type: 'MOVING_PLATFORM',
      x: 1100,
      y: gameHeight - 100,
      properties: {
        pattern: 'VERTICAL',
        endX: 1100,
        endY: gameHeight - 250,
        speed: 60,
        waitTime: 800,
      },
    });
    
    // 回復アイテムを配置
    this.obstacleManager.spawnObstacle({
      type: 'FOOD',
      x: 350,
      y: gameHeight - 80,
      properties: { foodType: 'APPLE' },
    });
    this.obstacleManager.spawnObstacle({
      type: 'FOOD',
      x: 850,
      y: gameHeight - 200,
      properties: { foodType: 'TOMATO' },
    });
    this.obstacleManager.spawnObstacle({
      type: 'FOOD',
      x: 1300,
      y: gameHeight - 280,
      properties: { foodType: 'MAXIM_TOMATO' },
    });
    
    // コリジョン設定
    this.obstacleManager.setupCollisions(this.kirby, {
      onDamage: (damage, knockbackX, knockbackY) => {
        this.handleDamage(damage, knockbackX, knockbackY);
      },
      onHeal: (amount) => {
        this.handleHeal(amount);
      },
    });
  }
  
  /**
   * ダメージ処理
   */
  private handleDamage(damage: number, knockbackX: number, knockbackY: number): void {
    // ノックバック
    const body = this.kirby.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockbackX, knockbackY);
    
    // TODO: HPシステム実装時にダメージを適用
    console.log(`Damage: ${damage}`);
    
    // ダメージエフェクト
    this.cameras.main.shake(100, 0.01);
  }
  
  /**
   * 回復処理
   */
  private handleHeal(amount: number): void {
    // TODO: HPシステム実装時に回復を適用
    console.log(`Heal: ${amount}`);
    
    // 回復エフェクト（キラキラ）
    this.tweens.add({
      targets: this.kirby,
      tint: { from: 0xFFFFFF, to: 0x00FF00 },
      duration: 200,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.kirby.clearTint(),
    });
  }
  
  private getEnemyTexture(type: EnemyType): string {
    switch (type) {
      case 'FIRE': return 'waddle-fire';
      case 'ICE': return 'waddle-ice';
      default: return 'waddle-idle';
    }
  }
  
  private updateEnemies(delta: number): void {
    this.enemyGroup.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const id = enemy.getData('id') as string;
      const isBeingInhaled = enemy.getData('isBeingInhaled') as boolean;
      
      if (isBeingInhaled) {
        enemy.setVelocityX(0);
        enemy.setTexture('waddle-inhaled');
        return;
      }
      
      const startX = enemy.getData('startX') as number;
      const patrolRange = enemy.getData('patrolRange') as number;
      let direction = enemy.getData('direction') as number;
      
      if (enemy.x > startX + patrolRange) {
        direction = -1;
        enemy.setData('direction', -1);
      } else if (enemy.x < startX - patrolRange) {
        direction = 1;
        enemy.setData('direction', 1);
      }
      
      enemy.setVelocityX(direction * 60);
      enemy.setFlipX(direction < 0);
      
      const timer = (this.enemyAnimTimers.get(id) || 0) + delta;
      this.enemyAnimTimers.set(id, timer);
      
      const type = enemy.getData('type') as EnemyType;
      if (type === 'NORMAL') {
        if (timer > 200) {
          this.enemyAnimTimers.set(id, 0);
          const currentTexture = enemy.texture.key;
          enemy.setTexture(currentTexture === 'waddle-idle' ? 'waddle-walk1' : 'waddle-idle');
        }
      }
    });
  }
  
  // ============================================
  // 入力処理
  // ============================================
  
  private setupKeyboardInput(): void {
    if (!this.input.keyboard) return;
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  }
  
  private getUnifiedInput() {
    const virtualInput = getGameInput();
    
    const keyboardMoveX = 
      (this.cursors?.left.isDown ? -1 : 0) +
      (this.cursors?.right.isDown ? 1 : 0);
    const keyboardMoveY =
      (this.cursors?.up.isDown ? -1 : 0) +
      (this.cursors?.down.isDown || this.downKey?.isDown ? 1 : 0);
    const keyboardJump = this.jumpKey?.isDown ?? false;
    const keyboardAction = this.actionKey?.isDown ?? false;
    
    const moveX = virtualInput.moveX !== 0 ? virtualInput.moveX : keyboardMoveX;
    const moveY = virtualInput.moveY !== 0 ? virtualInput.moveY : keyboardMoveY;
    const jump = virtualInput.jump || keyboardJump;
    const action = virtualInput.action || keyboardAction;
    
    return {
      moveX,
      moveY,
      jump,
      jumpPressed: jump && !this.wasJumpPressed,
      action,
      actionPressed: action && !this.wasActionPressed,
    };
  }
  
  // ============================================
  // 移動処理
  // ============================================
  
  private handleMovement(
    input: ReturnType<typeof this.getUnifiedInput>,
    state: KirbyState
  ): void {
    const actions = getGameActions();
    
    if (state === 'INHALING') {
      this.kirby.setVelocityX(0);
      return;
    }
    
    const velocityX = input.moveX * this.physicsConfig.walkSpeed;
    this.kirby.setVelocityX(velocityX);
    
    if (input.moveX < 0) {
      this.kirby.setFlipX(true);
      actions.setKirbyDirection('left');
    } else if (input.moveX > 0) {
      this.kirby.setFlipX(false);
      actions.setKirbyDirection('right');
    }
    
    const body = this.kirby.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down && input.moveX !== 0 && state === 'IDLE') {
      actions.setKirbyState('WALKING');
    } else if (body.blocked.down && input.moveX === 0 && state === 'WALKING') {
      actions.setKirbyState('IDLE');
    }
  }
  
  // ============================================
  // ジャンプ/ホバリング（Step 2: 物理挙動）
  // ============================================
  
  private handleJumpAndHover(
    input: ReturnType<typeof this.getUnifiedInput>,
    isOnGround: boolean,
    kirbyData: ReturnType<typeof getKirbyData>,
    delta: number
  ): void {
    const actions = getGameActions();
    const body = this.kirby.body as Phaser.Physics.Arcade.Body;
    
    if (isOnGround) {
      if (input.jumpPressed && kirbyData.state !== 'FULL') {
        body.setVelocityY(this.physicsConfig.jumpVelocity);
        actions.setKirbyState('JUMPING');
        actions.setKirbyHoverTime(0);
        
        this.tweens.add({
          targets: this.kirby,
          scaleX: 0.8,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
      }
    } else {
      if (kirbyData.state === 'HOVERING') {
        this.processHovering(input, kirbyData, delta, body, actions);
      } else if (kirbyData.state === 'JUMPING' || kirbyData.state === 'FALLING') {
        const canHover = kirbyData.hoverTime < kirbyData.maxHoverTime;
        if (input.jumpPressed && canHover) {
          actions.setKirbyState('HOVERING');
          body.setVelocityY(this.physicsConfig.hoverVelocity);
          
          this.tweens.add({
            targets: this.kirby,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 150,
            ease: 'Bounce.easeOut',
          });
        } else if (body.velocity.y > 0 && kirbyData.state === 'JUMPING') {
          actions.setKirbyState('FALLING');
        }
      }
    }
    
    if (isOnGround && 
        (kirbyData.state === 'JUMPING' || 
         kirbyData.state === 'FALLING' || 
         kirbyData.state === 'HOVERING')) {
      actions.setKirbyState(kirbyData.inhaledEnemy ? 'FULL' : 'IDLE');
      actions.setKirbyHoverTime(0);
      
      this.tweens.add({
        targets: this.kirby,
        scaleX: 1.2,
        scaleY: 0.8,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.kirby.setScale(1);
        },
      });
    }
  }
  
  private processHovering(
    input: ReturnType<typeof this.getUnifiedInput>,
    kirbyData: ReturnType<typeof getKirbyData>,
    delta: number,
    body: Phaser.Physics.Arcade.Body,
    actions: ReturnType<typeof getGameActions>
  ): void {
    if (input.jump) {
      const hoverProgress = kirbyData.hoverTime / kirbyData.maxHoverTime;
      const hoverPower = this.physicsConfig.hoverVelocity * (1 - hoverProgress * 0.5);
      body.setVelocityY(hoverPower);
      
      actions.setKirbyHoverTime(kirbyData.hoverTime + delta);
      
      if (kirbyData.hoverTime >= kirbyData.maxHoverTime) {
        actions.setKirbyState('FALLING');
        
        this.tweens.add({
          targets: this.kirby,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
        });
      }
    } else {
      const currentVelY = body.velocity.y;
      const targetVelY = this.physicsConfig.hoverFallSpeed;
      const newVelY = Phaser.Math.Linear(currentVelY, targetVelY, 0.1);
      body.setVelocityY(newVelY);
    }
  }
  
  // ============================================
  // 吸い込み処理（Step 2: 吸い込みロジック）
  // ============================================
  
  private handleInhale(delta: number): void {
    const actions = getGameActions();
    const kirbyData = getKirbyData();
    
    if (kirbyData.state !== 'INHALING' && kirbyData.state !== 'FULL') {
      actions.setKirbyState('INHALING');
    }
    
    this.drawInhaleArea();
    this.pullEnemies(delta);
  }
  
  private drawInhaleArea(): void {
    this.inhaleGraphics.clear();
    
    const kirbyData = getKirbyData();
    const x = this.kirby.x;
    const y = this.kirby.y;
    const direction = kirbyData.direction === 'right' ? 0 : Math.PI;
    
    const layers = 5;
    for (let i = layers; i >= 1; i--) {
      const alpha = 0.1 + (layers - i) * 0.05;
      const radius = this.inhaleConfig.radius * (i / layers);
      
      this.inhaleGraphics.fillStyle(0x00FFFF, alpha);
      this.inhaleGraphics.beginPath();
      this.inhaleGraphics.moveTo(x, y);
      
      const startAngle = direction - this.inhaleConfig.angle / 2;
      const endAngle = direction + this.inhaleConfig.angle / 2;
      
      this.inhaleGraphics.arc(x, y, radius, startAngle, endAngle, false);
      this.inhaleGraphics.closePath();
      this.inhaleGraphics.fillPath();
    }
    
    this.inhaleGraphics.lineStyle(2, 0x00FFFF, 0.5);
    const lineCount = 8;
    for (let i = 0; i < lineCount; i++) {
      const angleOffset = (i / lineCount - 0.5) * this.inhaleConfig.angle;
      const angle = direction + angleOffset;
      const length = this.inhaleConfig.radius * (0.5 + Math.random() * 0.5);
      
      this.inhaleGraphics.beginPath();
      this.inhaleGraphics.moveTo(
        x + Math.cos(angle) * 30,
        y + Math.sin(angle) * 30
      );
      this.inhaleGraphics.lineTo(
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length
      );
      this.inhaleGraphics.strokePath();
    }
  }
  
  private pullEnemies(delta: number): void {
    const kirbyData = getKirbyData();
    const actions = getGameActions();
    const kirbyX = this.kirby.x;
    const kirbyY = this.kirby.y;
    const direction = kirbyData.direction === 'right' ? 0 : Math.PI;
    
    this.enemyGroup.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const enemyX = enemy.x;
      const enemyY = enemy.y;
      
      const dx = enemyX - kirbyX;
      const dy = enemyY - kirbyY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angleToEnemy = Math.atan2(dy, dx);
      
      let angleDiff = angleToEnemy - direction;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const inRange = distance < this.inhaleConfig.radius &&
                      Math.abs(angleDiff) < this.inhaleConfig.angle / 2;
      
      if (inRange) {
        const enemyId = enemy.getData('id') as string;
        
        if (!enemy.getData('isBeingInhaled')) {
          enemy.setData('isBeingInhaled', true);
          actions.setEnemyBeingInhaled(enemyId, true);
        }
        
        const distanceFactor = 1 - (distance / this.inhaleConfig.radius);
        const pullForce = this.inhaleConfig.pullForce * (1 + distanceFactor * 2);
        const pullSpeed = pullForce * (delta / 1000);
        
        const pullX = -dx / distance * pullSpeed;
        const pullY = -dy / distance * pullSpeed;
        
        enemy.x += pullX;
        enemy.y += pullY;
        
        enemy.angle += 10;
        
        if (distance < this.inhaleConfig.captureDistance) {
          const enemyType = enemy.getData('type') as EnemyType;
          actions.inhaleEnemy(enemyType);
          actions.removeEnemy(enemyId);
          actions.addScore(100);
          
          this.createInhaleEffect(enemy.x, enemy.y);
          
          enemy.destroy();
        }
      } else {
        if (enemy.getData('isBeingInhaled')) {
          enemy.setData('isBeingInhaled', false);
          enemy.angle = 0;
          const enemyId = enemy.getData('id') as string;
          actions.setEnemyBeingInhaled(enemyId, false);
        }
      }
    });
  }
  
  private createInhaleEffect(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particle-inhale', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 10,
    });
    
    this.time.delayedCall(500, () => particles.destroy());
  }
  
  // ============================================
  // 頬張り状態の処理
  // ============================================
  
  private handleFullState(input: ReturnType<typeof this.getUnifiedInput>): void {
    const actions = getGameActions();
    const kirbyData = getKirbyData();
    
    if (input.actionPressed) {
      this.spitStar();
      actions.releaseEnemy();
      actions.addScore(50);
    } else if (input.moveY > 0.5) {
      const enemyType = kirbyData.inhaledEnemy;
      if (enemyType && enemyType !== 'NORMAL') {
        actions.setCopyAbility(enemyType);
        this.createCopyAbilityEffect();
      } else {
        actions.releaseEnemy();
      }
    }
  }
  
  private spitStar(): void {
    const kirbyData = getKirbyData();
    const direction = kirbyData.direction === 'right' ? 1 : -1;
    
    const star = this.physics.add.sprite(
      this.kirby.x + direction * 40,
      this.kirby.y,
      'star'
    );
    
    star.setVelocityX(direction * 500);
    star.setDepth(15);
    
    this.tweens.add({
      targets: star,
      angle: direction * 720,
      duration: 1000,
    });
    
    this.physics.add.overlap(star, this.enemyGroup, (starObj, enemyObj) => {
      const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
      const enemyId = enemy.getData('id') as string;
      
      getGameActions().removeEnemy(enemyId);
      getGameActions().addScore(200);
      
      this.createInhaleEffect(enemy.x, enemy.y);
      enemy.destroy();
      (starObj as Phaser.Physics.Arcade.Sprite).destroy();
    });
    
    this.time.delayedCall(2000, () => {
      if (star.active) star.destroy();
    });
    
    this.tweens.add({
      targets: this.kirby,
      scaleX: 0.9,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
    });
  }
  
  private createCopyAbilityEffect(): void {
    const kirbyData = getKirbyData();
    const abilityColor = getAbilityColor(kirbyData.copyAbility);
    
    // 白いフラッシュ
    const flash = this.add.circle(this.kirby.x, this.kirby.y, 100, 0xFFFFFF, 0.8);
    flash.setDepth(20);
    
    this.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
    
    // 能力の色のリング
    const ring = this.add.circle(this.kirby.x, this.kirby.y, 30, abilityColor, 0.6);
    ring.setDepth(19);
    ring.setStrokeStyle(4, abilityColor);
    
    this.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 600,
      onComplete: () => ring.destroy(),
    });
    
    // 新しい能力インスタンスを作成
    this.currentAbility?.destroy();
    this.currentAbility = createAbility(kirbyData.copyAbility);
    this.kirbyTintColor = abilityColor;
  }
  
  // ============================================
  // コピー能力システム
  // ============================================
  
  /**
   * Zustandストアとローカル能力インスタンスを同期
   */
  private syncCopyAbility(copyAbility: CopyAbility): void {
    // 能力が変わった場合、インスタンスを更新
    if (copyAbility === 'NONE' && this.currentAbility) {
      this.currentAbility.destroy();
      this.currentAbility = null;
      this.kirbyTintColor = null;
    } else if (copyAbility !== 'NONE' && (!this.currentAbility || this.currentAbility.type !== copyAbility)) {
      this.currentAbility?.destroy();
      this.currentAbility = createAbility(copyAbility);
      this.kirbyTintColor = getAbilityColor(copyAbility);
    }
  }
  
  /**
   * コピー能力の発動処理
   */
  private handleAbilityAction(
    input: ReturnType<typeof this.getUnifiedInput>,
    kirbyData: ReturnType<typeof getKirbyData>,
    _delta: number
  ): void {
    if (!this.currentAbility) return;
    
    const actions = getGameActions();
    
    // アクションボタンで能力発動
    if (input.action && !this.currentAbility.isOnCooldown) {
      const context = this.getAbilityContext();
      const activated = this.currentAbility.execute(context);
      
      if (activated) {
        actions.setKirbyState('ATTACKING');
        actions.setAbilityActive(true);
        
        // 能力発動時のスケールエフェクト
        this.tweens.add({
          targets: this.kirby,
          scaleX: 0.85,
          scaleY: 1.15,
          duration: 80,
          yoyo: true,
        });
      }
    }
    
    // アクションボタンを離したら能力を停止
    if (!input.action && kirbyData.isAbilityActive) {
      const context = this.getAbilityContext();
      this.currentAbility.deactivate(context);
      
      const isOnGround = this.kirby.body?.blocked.down ?? false;
      actions.setKirbyState(isOnGround ? 'IDLE' : 'FALLING');
      actions.setAbilityActive(false);
    }
  }
  
  /**
   * コピー能力の更新
   */
  private updateAbility(delta: number, _kirbyData: ReturnType<typeof getKirbyData>): void {
    if (!this.currentAbility) return;
    
    const context = this.getAbilityContext();
    this.currentAbility.update(context, delta);
    
    // クールダウン状態をストアに反映
    const actions = getGameActions();
    actions.setAbilityCooldown(this.currentAbility.cooldownProgress);
  }
  
  /**
   * 能力実行用のコンテキストを生成
   */
  private getAbilityContext(): AbilityContext {
    return {
      scene: this,
      owner: this.kirby,
      direction: getKirbyData().direction,
      enemies: this.enemyGroup,
      platforms: this.platforms,
    };
  }
  
  /**
   * カービィの色を能力に応じて更新
   */
  private updateKirbyTint(kirbyData: ReturnType<typeof getKirbyData>): void {
    if (kirbyData.copyAbility !== 'NONE' && this.kirbyTintColor) {
      // 能力保持時は薄くティントを適用
      this.kirby.setTint(
        Phaser.Display.Color.GetColor(
          ((this.kirbyTintColor >> 16) & 0xFF) * 0.3 + 255 * 0.7,
          ((this.kirbyTintColor >> 8) & 0xFF) * 0.3 + 255 * 0.7,
          (this.kirbyTintColor & 0xFF) * 0.3 + 255 * 0.7
        )
      );
    } else {
      this.kirby.clearTint();
    }
    
    // 攻撃中は色を強調
    if (kirbyData.state === 'ATTACKING' && this.kirbyTintColor) {
      this.kirby.setTint(this.kirbyTintColor);
    }
  }
  
  // ============================================
  // アニメーション更新
  // ============================================
  
  private updateAnimations(
    delta: number,
    state: KirbyState
  ): void {
    if (state === 'WALKING') {
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer > 150) {
        this.walkAnimTimer = 0;
        this.walkAnimFrame = this.walkAnimFrame === 0 ? 1 : 0;
      }
    }
    
    const textureKey = this.getKirbyTexture(state);
    if (this.kirby.texture.key !== textureKey) {
      this.kirby.setTexture(textureKey);
      this.adjustKirbyBodySize(state);
    }
  }
  
  private getKirbyTexture(state: KirbyState): string {
    switch (state) {
      case 'WALKING':
        return this.walkAnimFrame === 0 ? 'kirby-walk1' : 'kirby-walk2';
      case 'JUMPING':
      case 'FALLING':
        return 'kirby-jump';
      case 'HOVERING':
        return 'kirby-hover';
      case 'FULL':
        return 'kirby-full';
      case 'INHALING':
        return 'kirby-inhale';
      default:
        return 'kirby-idle';
    }
  }
  
  private adjustKirbyBodySize(state: KirbyState): void {
    const body = this.kirby.body as Phaser.Physics.Arcade.Body;
    
    switch (state) {
      case 'HOVERING':
        body.setSize(50, 44);
        body.setOffset(5, 4);
        break;
      case 'FULL':
      case 'INHALING':
        body.setSize(48, 44);
        body.setOffset(4, 4);
        break;
      default:
        body.setSize(40, 44);
        body.setOffset(4, 4);
        break;
    }
  }
  
  private updateParticles(state: KirbyState): void {
    if (state === 'HOVERING') {
      this.hoverParticles.setPosition(this.kirby.x, this.kirby.y + 25);
      this.hoverParticles.start();
    } else {
      this.hoverParticles.stop();
    }
  }
}
