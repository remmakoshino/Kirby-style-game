/**
 * ピクセルアート生成ユーティリティ
 * マインクラフト風のブロック状キャラクターを生成
 */

export type PixelColor = string | null; // null = 透明

/**
 * ピクセルアートデータからCanvasテクスチャを生成
 */
export function createPixelArtTexture(
  scene: Phaser.Scene,
  key: string,
  pixelData: PixelColor[][],
  pixelSize: number = 4
): void {
  const height = pixelData.length;
  const width = pixelData[0]?.length || 0;
  
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixelData[y][x];
      if (color) {
        graphics.fillStyle(parseInt(color.replace('#', '0x'), 16), 1);
        graphics.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  
  graphics.generateTexture(key, width * pixelSize, height * pixelSize);
  graphics.destroy();
}

/**
 * スプライトシートを生成（複数フレーム）
 */
export function createPixelArtSpriteSheet(
  scene: Phaser.Scene,
  key: string,
  frames: PixelColor[][][],
  pixelSize: number = 4
): void {
  if (frames.length === 0) return;
  
  const height = frames[0].length;
  const width = frames[0][0]?.length || 0;
  const frameWidth = width * pixelSize;
  const frameHeight = height * pixelSize;
  
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  frames.forEach((frame, frameIndex) => {
    const offsetX = frameIndex * frameWidth;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = frame[y][x];
        if (color) {
          graphics.fillStyle(parseInt(color.replace('#', '0x'), 16), 1);
          graphics.fillRect(
            offsetX + x * pixelSize,
            y * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }
  });
  
  const totalWidth = frameWidth * frames.length;
  graphics.generateTexture(key, totalWidth, frameHeight);
  graphics.destroy();
  
  // スプライトシートとして登録
  scene.textures.get(key).add(
    '__BASE',
    0,
    0, 0,
    totalWidth, frameHeight
  );
  
  // 各フレームを追加
  frames.forEach((_, index) => {
    scene.textures.get(key).add(
      index,
      0,
      index * frameWidth, 0,
      frameWidth, frameHeight
    );
  });
}
