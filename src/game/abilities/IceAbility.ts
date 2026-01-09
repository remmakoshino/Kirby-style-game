/**
 * アイス能力 (Ice Ability)
 * 
 * 前方に冷気を放出し、敵を凍結させる。
 * 凍結した敵は一定時間後に破壊される。
 */

import Phaser from 'phaser';
import {
  BaseAbility,
  type AbilityContext,
  type AbilityConfig,
  type HitboxConfig,
} from './BaseAbility';

const ICE_CONFIG: AbilityConfig = {
  name: 'アイス',
  type: 'ICE',
  cooldown: 600,
  duration: 700,
  damage: 1,
  color: 0x00BFFF,        // ディープスカイブルー
  particleColor: 0xADD8E6, // ライトブルー
};

export class IceAbility extends BaseAbility {
  private iceParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private frozenEnemies: Set<string> = new Set();
  
  constructor() {
    super(ICE_CONFIG);
  }
  
  protected getHitboxConfig(): HitboxConfig {
    return {
      shape: 'cone',
      width: 100,
      height: 60,
      offsetX: 60,
      offsetY: 0,
      angle: Math.PI / 4,
    };
  }
  
  protected onActivate(context: AbilityContext): void {
    this.frozenEnemies.clear();
    this.createIceParticles(context);
    
    // 冷気の発動エフェクト
    context.scene.tweens.add({
      targets: context.owner,
      tint: 0xADD8E6,
      duration: 100,
      yoyo: true,
    });
  }
  
  protected onUpdate(context: AbilityContext, _delta: number): void {
    this.updateIceParticles(context);
  }
  
  protected onDeactivate(_context: AbilityContext): void {
    this.frozenEnemies.clear();
    
    if (this.iceParticles) {
      this.iceParticles.stop();
      setTimeout(() => {
        this.iceParticles?.destroy();
        this.iceParticles = null;
      }, 500);
    }
  }
  
  protected drawEffect(
    graphics: Phaser.GameObjects.Graphics,
    context: AbilityContext,
    progress: number
  ): void {
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    const x = context.owner.x;
    const y = context.owner.y;
    const time = Date.now() * 0.01;
    const intensity = Math.min(progress * 2, 1);
    
    // 冷気の霧
    graphics.fillStyle(0x87CEEB, 0.3 * intensity);
    for (let i = 0; i < 4; i++) {
      const wave = Math.sin(time + i * 0.8) * 8;
      const offsetX = (30 + i * 25) * directionMultiplier;
      graphics.fillEllipse(x + offsetX, y + wave, 40 - i * 5, 30 - i * 3);
    }
    
    // 氷の結晶
    graphics.fillStyle(0xFFFFFF, 0.6 * intensity);
    for (let i = 0; i < 6; i++) {
      const angle = (time * 0.5 + i * Math.PI / 3) * directionMultiplier;
      const distance = 40 + Math.sin(time + i) * 10;
      const crystalX = x + Math.cos(angle) * distance * directionMultiplier;
      const crystalY = y + Math.sin(angle) * 15;
      this.drawIceCrystal(graphics, crystalX, crystalY, 6, intensity);
    }
  }
  
  private drawIceCrystal(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    alpha: number
  ): void {
    graphics.fillStyle(0xFFFFFF, 0.8 * alpha);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      if (i === 0) graphics.moveTo(px, py);
      else graphics.lineTo(px, py);
    }
    graphics.closePath();
    graphics.fillPath();
  }
  
  private createIceParticles(context: AbilityContext): void {
    if (!context.scene.textures.exists('particle-ice')) {
      const graphics = context.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xADD8E6, 1);
      graphics.fillCircle(6, 6, 6);
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.fillCircle(6, 6, 3);
      graphics.generateTexture('particle-ice', 12, 12);
      graphics.destroy();
    }
    
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    
    this.iceParticles = context.scene.add.particles(
      context.owner.x + 30 * directionMultiplier,
      context.owner.y,
      'particle-ice',
      {
        speed: { min: 100, max: 200 },
        angle: directionMultiplier === 1
          ? { min: -30, max: 30 }
          : { min: 150, max: 210 },
        scale: { start: 0.6, end: 0 },
        lifespan: { min: 300, max: 500 },
        frequency: 25,
        alpha: { start: 0.8, end: 0 },
      }
    );
    this.iceParticles.setDepth(14);
  }
  
  private updateIceParticles(context: AbilityContext): void {
    if (!this.iceParticles) return;
    
    const directionMultiplier = context.direction === 'right' ? 1 : -1;
    this.iceParticles.setPosition(
      context.owner.x + 30 * directionMultiplier,
      context.owner.y
    );
  }
  
  protected onEnemyHit(context: AbilityContext, enemy: Phaser.Physics.Arcade.Sprite): void {
    const enemyId = enemy.getData('id') as string;
    
    if (this.frozenEnemies.has(enemyId)) return;
    this.frozenEnemies.add(enemyId);
    
    // 凍結エフェクト
    enemy.setTint(0x87CEEB);
    enemy.setVelocity(0, 0);
    
    const iceBlock = context.scene.add.rectangle(
      enemy.x, enemy.y,
      enemy.width + 10, enemy.height + 10,
      0xADD8E6, 0.5
    );
    iceBlock.setStrokeStyle(2, 0xFFFFFF);
    iceBlock.setDepth(enemy.depth + 1);
    
    // 凍結後に破壊
    context.scene.time.delayedCall(500, () => {
      if (enemy.active) {
        this.createShatterEffect(context, enemy.x, enemy.y);
        iceBlock.destroy();
        super.onEnemyHit(context, enemy);
      }
    });
  }
  
  private createShatterEffect(context: AbilityContext, x: number, y: number): void {
    // 氷が砕けるパーティクル
    const shatter = context.scene.add.particles(x, y, 'particle-ice', {
      speed: { min: 80, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 600,
      quantity: 15,
      rotate: { min: 0, max: 360 },
    });
    
    context.scene.time.delayedCall(700, () => shatter.destroy());
  }
}
