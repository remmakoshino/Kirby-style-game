/**
 * Boss - デデデ大王風ボスキャラクター
 * 
 * ステートマシンで4つの行動パターンを制御：
 * - IDLE: 待機（カービィの方を向く）
 * - SUPER_JUMP: 大ジャンプ + 着地衝撃波
 * - HAMMER_SWING: ハンマー攻撃
 * - BELLY_SLIDE: 腹ばい突進
 */

import Phaser from 'phaser';
import { ShockWave } from './ShockWave';

// ============================================
// ボスの状態定義
// ============================================

export type BossState = 
  | 'IDLE'          // 待機
  | 'SUPER_JUMP'    // 大ジャンプ（上昇中）
  | 'FALLING'       // 落下中
  | 'LANDING'       // 着地演出
  | 'HAMMER_SWING'  // ハンマー攻撃
  | 'BELLY_SLIDE'   // 腹ばい突進
  | 'STUNNED'       // スタン（ダメージ後）
  | 'DEFEATED';     // 撃破

export type BossDirection = 'left' | 'right';

// ============================================
// ボスの設定
// ============================================

export interface BossConfig {
  maxHp: number;
  damage: number;
  jumpHeight: number;
  jumpSpeed: number;
  slideSpeed: number;
  hammerRange: number;
  idleTime: number;        // 待機時間(ms)
  stunTime: number;        // スタン時間(ms)
}

export const DEFAULT_BOSS_CONFIG: BossConfig = {
  maxHp: 100,
  damage: 2,
  jumpHeight: 400,
  jumpSpeed: 600,
  slideSpeed: 500,
  hammerRange: 120,
  idleTime: 1500,
  stunTime: 1000,
};

// ============================================
// Bossクラス
// ============================================

export class Boss {
  // Phaser参照
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly scene: Phaser.Scene;
  
  // 設定
  private readonly config: BossConfig;
  
  // 状態
  private _state: BossState = 'IDLE';
  private _direction: BossDirection = 'left';
  private _hp: number;
  private _maxHp: number;
  
  // ターゲット（カービィ）参照
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  
  // タイマー
  private stateTimer = 0;
  private invincibleTimer = 0;
  private attackCooldown = 0;
  
  // ジャンプ関連
  private targetJumpX = 0;
  
  // 衝撃波グループ
  public shockWaveGroup!: Phaser.Physics.Arcade.Group;
  
  // ハンマー攻撃判定
  public hammerHitbox!: Phaser.GameObjects.Zone;
  
  // 攻撃予告グラフィック
  private attackIndicator!: Phaser.GameObjects.Graphics;
  
  // アニメーション
  private animTimer = 0;
  private animFrame = 0;
  
  // コールバック
  public onHpChange?: (hp: number, maxHp: number) => void;
  public onDefeated?: () => void;
  public onDamagePlayer?: (damage: number) => void;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: BossConfig = DEFAULT_BOSS_CONFIG
  ) {
    this.scene = scene;
    this.config = config;
    this._hp = config.maxHp;
    this._maxHp = config.maxHp;
    
    // ボススプライト作成
    this.sprite = scene.physics.add.sprite(x, y, 'boss-idle');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(10);
    this.sprite.setData('type', 'BOSS');
    
    // 物理ボディ設定（大きめのヒットボックス）
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 56);
    body.setOffset(8, 8);
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    
    // 衝撃波グループ
    this.shockWaveGroup = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: false,
    });
    
    // ハンマー攻撃の判定ゾーン
    this.hammerHitbox = scene.add.zone(x, y, 80, 60);
    scene.physics.world.enable(this.hammerHitbox);
    (this.hammerHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.hammerHitbox.setData('active', false);
    
    // 攻撃予告グラフィック
    this.attackIndicator = scene.add.graphics();
    this.attackIndicator.setDepth(9);
    
    // 初期状態
    this.enterState('IDLE');
  }
  
  // ============================================
  // ゲッター
  // ============================================
  
  get state(): BossState {
    return this._state;
  }
  
  get direction(): BossDirection {
    return this._direction;
  }
  
  get hp(): number {
    return this._hp;
  }
  
  get maxHp(): number {
    return this._maxHp;
  }
  
  get isAlive(): boolean {
    return this._hp > 0;
  }
  
  get isInvincible(): boolean {
    return this.invincibleTimer > 0;
  }
  
  // ============================================
  // ターゲット設定
  // ============================================
  
  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }
  
  // ============================================
  // メイン更新ループ
  // ============================================
  
  update(delta: number): void {
    if (this._state === 'DEFEATED') {
      this.updateDefeated(delta);
      return;
    }
    
    // タイマー更新
    this.stateTimer -= delta;
    if (this.invincibleTimer > 0) this.invincibleTimer -= delta;
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    
    // ターゲットの方を向く（特定状態以外）
    if (this.target && this._state !== 'BELLY_SLIDE' && this._state !== 'SUPER_JUMP') {
      this.faceTarget();
    }
    
    // ステートマシンによる処理分岐
    switch (this._state) {
      case 'IDLE':
        this.updateIdle(delta);
        break;
      case 'SUPER_JUMP':
        this.updateSuperJump(delta);
        break;
      case 'FALLING':
        this.updateFalling(delta);
        break;
      case 'LANDING':
        this.updateLanding(delta);
        break;
      case 'HAMMER_SWING':
        this.updateHammerSwing(delta);
        break;
      case 'BELLY_SLIDE':
        this.updateBellySlide(delta);
        break;
      case 'STUNNED':
        this.updateStunned(delta);
        break;
    }
    
    // 衝撃波の更新
    this.updateShockWaves(delta);
    
    // 攻撃予告の更新
    this.updateAttackIndicator();
    
    // ハンマー判定位置の更新
    this.updateHammerHitbox();
    
    // アニメーション更新
    this.updateAnimation(delta);
    
    // 無敵時間中は点滅
    if (this.invincibleTimer > 0) {
      this.sprite.setAlpha(Math.sin(this.invincibleTimer * 0.02) > 0 ? 1 : 0.3);
    } else {
      this.sprite.setAlpha(1);
    }
  }
  
  // ============================================
  // ステート遷移
  // ============================================
  
  private enterState(newState: BossState): void {
    const prevState = this._state;
    this._state = newState;
    
    // ステートに応じた初期化
    switch (newState) {
      case 'IDLE':
        this.stateTimer = this.config.idleTime;
        this.sprite.setVelocity(0, 0);
        break;
        
      case 'SUPER_JUMP':
        // ターゲットの頭上を狙う
        if (this.target) {
          this.targetJumpX = this.target.x;
        }
        // 上方向に大ジャンプ
        this.sprite.setVelocityY(-this.config.jumpSpeed);
        this.stateTimer = 800; // 上昇時間
        break;
        
      case 'FALLING':
        // ターゲット位置へ向かって落下
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        const dx = this.targetJumpX - this.sprite.x;
        body.setVelocityX(dx * 2); // 横移動調整
        body.setVelocityY(this.config.jumpSpeed * 1.5);
        break;
        
      case 'LANDING':
        this.stateTimer = 500; // 着地硬直
        this.sprite.setVelocity(0, 0);
        // 衝撃波生成
        this.createShockWaves();
        // 画面揺れ
        this.scene.cameras.main.shake(200, 0.02);
        break;
        
      case 'HAMMER_SWING':
        this.stateTimer = 600; // ハンマー攻撃時間
        this.sprite.setVelocityX(0);
        this.attackCooldown = 1500;
        break;
        
      case 'BELLY_SLIDE':
        const slideDir = this._direction === 'left' ? -1 : 1;
        this.sprite.setVelocityX(this.config.slideSpeed * slideDir);
        this.stateTimer = 2000; // 最大突進時間
        break;
        
      case 'STUNNED':
        this.stateTimer = this.config.stunTime;
        this.sprite.setVelocity(0, 0);
        break;
        
      case 'DEFEATED':
        this.sprite.setVelocity(0, 0);
        this.sprite.setTint(0x888888);
        this.stateTimer = 3000; // 撃破演出時間
        if (this.onDefeated) {
          // 少し遅延させて撃破コールバック
          this.scene.time.delayedCall(2000, () => {
            if (this.onDefeated) this.onDefeated();
          });
        }
        break;
    }
    
    console.log(`Boss state: ${prevState} -> ${newState}`);
  }
  
  // ============================================
  // 各ステートの更新処理
  // ============================================
  
  /**
   * 待機状態：一定時間後に次のアクションを選択
   */
  private updateIdle(_delta: number): void {
    if (this.stateTimer <= 0) {
      this.chooseNextAction();
    }
  }
  
  /**
   * 大ジャンプ（上昇中）
   */
  private updateSuperJump(_delta: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // 上昇が止まったら落下へ
    if (body.velocity.y >= 0 || this.stateTimer <= 0) {
      this.enterState('FALLING');
    }
  }
  
  /**
   * 落下中
   */
  private updateFalling(_delta: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // 地面に着地したら着地ステートへ
    if (body.blocked.down) {
      this.enterState('LANDING');
    }
  }
  
  /**
   * 着地演出
   */
  private updateLanding(_delta: number): void {
    if (this.stateTimer <= 0) {
      this.enterState('IDLE');
    }
  }
  
  /**
   * ハンマー攻撃
   */
  private updateHammerSwing(_delta: number): void {
    // 攻撃判定は別途コリジョンで処理
    if (this.stateTimer <= 0) {
      this.enterState('IDLE');
    }
  }
  
  /**
   * 腹ばい突進
   */
  private updateBellySlide(_delta: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // 壁にぶつかったらスタン
    if (body.blocked.left || body.blocked.right) {
      this.enterState('STUNNED');
      // 壁衝突時の衝撃波
      this.scene.cameras.main.shake(100, 0.01);
    }
    
    if (this.stateTimer <= 0) {
      this.enterState('IDLE');
    }
  }
  
  /**
   * スタン状態
   */
  private updateStunned(_delta: number): void {
    if (this.stateTimer <= 0) {
      this.enterState('IDLE');
    }
  }
  
  /**
   * 撃破状態
   */
  private updateDefeated(delta: number): void {
    this.animTimer += delta;
    // 点滅しながら消える演出
    if (this.animTimer > 100) {
      this.animTimer = 0;
      this.sprite.setAlpha(this.sprite.alpha === 1 ? 0.2 : 1);
    }
  }
  
  // ============================================
  // アクション選択AI
  // ============================================
  
  private chooseNextAction(): void {
    if (!this.target) {
      this.enterState('IDLE');
      return;
    }
    
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.target.x,
      this.target.y
    );
    
    // 近距離ならハンマー攻撃優先
    if (distanceToTarget < this.config.hammerRange && this.attackCooldown <= 0) {
      this.enterState('HAMMER_SWING');
      return;
    }
    
    // HP状況に応じて行動を変化
    const hpRatio = this._hp / this._maxHp;
    const rand = Math.random();
    
    if (hpRatio > 0.5) {
      // HP50%以上：通常パターン
      if (rand < 0.4) {
        this.enterState('SUPER_JUMP');
      } else if (rand < 0.7) {
        this.enterState('BELLY_SLIDE');
      } else {
        this.enterState('IDLE');
      }
    } else {
      // HP50%以下：激しい攻撃パターン
      if (rand < 0.5) {
        this.enterState('SUPER_JUMP');
      } else {
        this.enterState('BELLY_SLIDE');
      }
    }
  }
  
  // ============================================
  // ターゲット追跡
  // ============================================
  
  private faceTarget(): void {
    if (!this.target) return;
    
    const dx = this.target.x - this.sprite.x;
    const newDirection: BossDirection = dx < 0 ? 'left' : 'right';
    
    if (this._direction !== newDirection) {
      this._direction = newDirection;
      this.sprite.setFlipX(this._direction === 'left');
    }
  }
  
  // ============================================
  // 衝撃波生成
  // ============================================
  
  private createShockWaves(): void {
    const x = this.sprite.x;
    const y = this.sprite.y;
    
    // 左右に衝撃波を生成
    const leftWave = new ShockWave(this.scene, x, y, 'left');
    const rightWave = new ShockWave(this.scene, x, y, 'right');
    
    this.shockWaveGroup.add(leftWave.sprite);
    this.shockWaveGroup.add(rightWave.sprite);
    
    // スプライトに ShockWave インスタンスへの参照を保存
    leftWave.sprite.setData('shockWaveInstance', leftWave);
    rightWave.sprite.setData('shockWaveInstance', rightWave);
  }
  
  private updateShockWaves(_delta: number): void {
    this.shockWaveGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const wave = sprite.getData('shockWaveInstance') as ShockWave;
      
      if (wave) {
        wave.update();
        
        // 一定距離で消滅
        if (wave.shouldDestroy()) {
          wave.destroy();
          this.shockWaveGroup.remove(sprite, true, true);
        }
      }
    });
  }
  
  // ============================================
  // ダメージ処理
  // ============================================
  
  takeDamage(amount: number): void {
    if (this.isInvincible || this._state === 'DEFEATED') return;
    
    this._hp = Math.max(0, this._hp - amount);
    this.invincibleTimer = 500; // 0.5秒無敵
    
    // HP変更コールバック
    if (this.onHpChange) {
      this.onHpChange(this._hp, this._maxHp);
    }
    
    // 撃破判定
    if (this._hp <= 0) {
      this.enterState('DEFEATED');
    } else {
      // ダメージエフェクト
      this.sprite.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
      });
    }
  }
  
  // ============================================
  // アニメーション
  // ============================================
  
  private updateAnimation(delta: number): void {
    this.animTimer += delta;
    
    // 200msごとにフレーム切り替え
    if (this.animTimer > 200) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
    
    // ステートに応じたテクスチャ切り替え
    let textureKey = 'boss-idle';
    
    switch (this._state) {
      case 'IDLE':
      case 'STUNNED':
        textureKey = this.animFrame === 0 ? 'boss-idle' : 'boss-idle2';
        break;
      case 'SUPER_JUMP':
      case 'FALLING':
        textureKey = 'boss-jump';
        break;
      case 'LANDING':
        textureKey = 'boss-land';
        break;
      case 'HAMMER_SWING':
        textureKey = this.animFrame === 0 ? 'boss-hammer1' : 'boss-hammer2';
        break;
      case 'BELLY_SLIDE':
        textureKey = 'boss-slide';
        break;
      case 'DEFEATED':
        textureKey = 'boss-defeated';
        break;
    }
    
    if (this.sprite.texture.key !== textureKey) {
      this.sprite.setTexture(textureKey);
    }
  }
  
  // ============================================
  // 攻撃予告表示
  // ============================================
  
  private updateAttackIndicator(): void {
    this.attackIndicator.clear();
    
    // 攻撃予告を表示（各攻撃の準備段階で）
    switch (this._state) {
      case 'SUPER_JUMP':
        // ジャンプ中：着地予定地点に警告
        if (this.target) {
          this.attackIndicator.lineStyle(3, 0xff0000, 0.8);
          this.attackIndicator.strokeCircle(this.targetJumpX, this.sprite.y + 100, 30);
          // 点滅効果
          const alpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.3;
          this.attackIndicator.fillStyle(0xff0000, alpha);
          this.attackIndicator.fillCircle(this.targetJumpX, this.sprite.y + 100, 25);
        }
        break;
        
      case 'FALLING':
        // 落下中：着地予定地点に強い警告
        this.attackIndicator.lineStyle(4, 0xff0000, 1);
        this.attackIndicator.strokeCircle(this.targetJumpX, this.sprite.y + 50, 40);
        this.attackIndicator.fillStyle(0xff0000, 0.5);
        this.attackIndicator.fillCircle(this.targetJumpX, this.sprite.y + 50, 35);
        // 「!」マーク（テキストで代用）
        break;
        
      case 'HAMMER_SWING':
        // ハンマー攻撃範囲
        const hammerX = this._direction === 'left' 
          ? this.sprite.x - 60 
          : this.sprite.x + 60;
        this.attackIndicator.lineStyle(3, 0xffaa00, 0.8);
        this.attackIndicator.strokeRect(hammerX - 40, this.sprite.y - 80, 80, 80);
        // 点滅
        const hammerAlpha = 0.2 + Math.sin(Date.now() * 0.015) * 0.2;
        this.attackIndicator.fillStyle(0xffaa00, hammerAlpha);
        this.attackIndicator.fillRect(hammerX - 40, this.sprite.y - 80, 80, 80);
        break;
        
      case 'BELLY_SLIDE':
        // 突進方向の矢印
        const slideDir = this._direction === 'left' ? -1 : 1;
        const arrowX = this.sprite.x + slideDir * 100;
        this.attackIndicator.lineStyle(4, 0xff6600, 0.8);
        // 矢印を描く
        this.attackIndicator.beginPath();
        this.attackIndicator.moveTo(this.sprite.x + slideDir * 30, this.sprite.y - 30);
        this.attackIndicator.lineTo(arrowX, this.sprite.y - 30);
        this.attackIndicator.lineTo(arrowX - slideDir * 15, this.sprite.y - 45);
        this.attackIndicator.moveTo(arrowX, this.sprite.y - 30);
        this.attackIndicator.lineTo(arrowX - slideDir * 15, this.sprite.y - 15);
        this.attackIndicator.strokePath();
        break;
        
      case 'STUNNED':
        // スタン中：攻撃チャンス表示
        this.attackIndicator.lineStyle(3, 0x00ff00, 0.8);
        this.attackIndicator.strokeCircle(this.sprite.x, this.sprite.y - 80, 25);
        const stunAlpha = 0.3 + Math.sin(Date.now() * 0.008) * 0.3;
        this.attackIndicator.fillStyle(0x00ff00, stunAlpha);
        this.attackIndicator.fillCircle(this.sprite.x, this.sprite.y - 80, 20);
        break;
    }
  }
  
  // ============================================
  // ハンマー攻撃判定更新
  // ============================================
  
  private updateHammerHitbox(): void {
    // ハンマー攻撃中のみアクティブ
    const isHammerActive = this._state === 'HAMMER_SWING' && this.stateTimer < 400;
    this.hammerHitbox.setData('active', isHammerActive);
    
    if (isHammerActive) {
      const offsetX = this._direction === 'left' ? -60 : 60;
      this.hammerHitbox.setPosition(this.sprite.x + offsetX, this.sprite.y - 40);
    }
  }
  
  /**
   * ハンマー攻撃がアクティブかどうか
   */
  isHammerAttackActive(): boolean {
    return this.hammerHitbox.getData('active') as boolean;
  }
  
  /**
   * ハンマー攻撃のダメージ
   */
  getHammerDamage(): number {
    return this.config.damage;
  }
  
  // ============================================
  // クリーンアップ
  // ============================================
  
  destroy(): void {
    this.shockWaveGroup.clear(true, true);
    this.attackIndicator.destroy();
    this.hammerHitbox.destroy();
    this.sprite.destroy();
  }
}
