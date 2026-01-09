/**
 * メインApp コンポーネント
 * ゲーム全体を統括
 */

import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { VirtualPad } from './components/VirtualPad';
import { GameUI } from './components/GameUI';
import { BossHPBar } from './components/BossHPBar';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const startGame = useGameStore((state) => state.startGame);
  const isPlaying = useGameStore((state) => state.isPlaying);

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ゲーム開始ハンドラ
  const handleStart = () => {
    startGame();
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* タイトル画面 */}
      {!isPlaying && (
        <div
          style={{
            position: 'absolute',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '50px 80px',
            borderRadius: 20,
          }}
        >
          <h1
            style={{
              color: '#FF69B4',
              fontSize: '2.5rem',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            🌟 Kirby-Style Game 🌟
          </h1>
          <div
            style={{
              color: 'white',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: 1.8,
            }}
          >
            <p style={{ margin: '5px 0' }}>
              {isMobile ? 'タッチ操作:' : 'キーボード操作:'}
            </p>
            {isMobile ? (
              <>
                <p style={{ margin: '5px 0' }}>左: ジョイスティック（移動）</p>
                <p style={{ margin: '5px 0' }}>A: ジャンプ / ホバリング</p>
                <p style={{ margin: '5px 0' }}>B: 吸い込み / 攻撃</p>
              </>
            ) : (
              <>
                <p style={{ margin: '5px 0' }}>← →: 移動</p>
                <p style={{ margin: '5px 0' }}>Space: ジャンプ / ホバリング</p>
                <p style={{ margin: '5px 0' }}>X: 吸い込み / 攻撃</p>
                <p style={{ margin: '5px 0' }}>↓: コピー能力取得（頬張り時）</p>
              </>
            )}
          </div>
          <button
            onClick={handleStart}
            style={{
              padding: '15px 50px',
              fontSize: '1.5rem',
              backgroundColor: '#FF69B4',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Start Game
          </button>
        </div>
      )}

      {/* ゲームコンテナ */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '70vh' : '85vh',
          maxWidth: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GameCanvas />
        
        {isPlaying && (
          <>
            <GameUI />
            <BossHPBar />
            <VirtualPad visible={isMobile} />
          </>
        )}
      </div>

      {/* PC用操作説明 */}
      {isPlaying && !isMobile && (
        <div
          style={{
            marginTop: 20,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
          }}
        >
          ← → 移動 | Space ジャンプ/ホバリング | X 吸い込み/攻撃 | ↓ コピー能力
        </div>
      )}
    </div>
  );
};

export default App;
