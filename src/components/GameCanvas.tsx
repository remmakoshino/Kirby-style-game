/**
 * Phaserゲームを内包するReactコンポーネント（レスポンシブ対応強化版）
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';

interface GameCanvasProps {
  baseWidth?: number;
  baseHeight?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  baseWidth = 800,
  baseHeight = 600,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [dimensions, setDimensions] = useState({ width: baseWidth, height: baseHeight });

  // 画面サイズに応じた最適なゲームサイズを計算
  const calculateOptimalSize = useCallback(() => {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    const aspectRatio = baseWidth / baseHeight;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    // 高さが画面を超える場合は高さ基準で調整
    if (height > maxHeight * 0.85) {
      height = maxHeight * 0.85;
      width = height * aspectRatio;
    }
    
    // 最小サイズを保証
    width = Math.max(width, 320);
    height = Math.max(height, 240);
    
    return { width: Math.floor(width), height: Math.floor(height) };
  }, [baseWidth, baseHeight]);

  // リサイズハンドラ
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = calculateOptimalSize();
      setDimensions(newDimensions);
      
      if (gameRef.current) {
        gameRef.current.scale.resize(newDimensions.width, newDimensions.height);
        gameRef.current.scale.refresh();
      }
    };

    // 初期サイズを設定
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [calculateOptimalSize]);

  // ゲーム初期化
  useEffect(() => {
    if (gameRef.current) return;
    if (!gameContainerRef.current) return;

    const config = createGameConfig(gameContainerRef.current, dimensions.width, dimensions.height);
    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // フルスクリーン切り替え（モバイル対応）
  const toggleFullscreen = useCallback(() => {
    if (gameRef.current) {
      if (gameRef.current.scale.isFullscreen) {
        gameRef.current.scale.stopFullscreen();
      } else {
        gameRef.current.scale.startFullscreen();
      }
    }
  }, []);

  return (
    <div
      ref={gameContainerRef}
      onDoubleClick={toggleFullscreen}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: `${dimensions.width}px`,
        maxHeight: `${dimensions.height}px`,
        margin: '0 auto',
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    />
  );
};
