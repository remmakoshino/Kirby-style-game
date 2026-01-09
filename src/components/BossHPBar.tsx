/**
 * BossHPBar - ボスHP表示コンポーネント
 * 
 * 画面上部に豪華なHPバーを表示する
 */

import { useGameStore } from '../store/gameStore';

export function BossHPBar() {
  const boss = useGameStore((state) => state.boss);
  const isBossBattle = useGameStore((state) => state.isBossBattle);
  
  // ボス戦でない、またはボスデータがない場合は非表示
  if (!isBossBattle || !boss) {
    return null;
  }
  
  const hpPercentage = (boss.hp / boss.maxHp) * 100;
  
  // HP残量による色変化
  const getHpColor = () => {
    if (hpPercentage > 60) return '#22c55e'; // 緑
    if (hpPercentage > 30) return '#eab308'; // 黄
    return '#ef4444'; // 赤
  };
  
  // HP残量によるグラデーション
  const getHpGradient = () => {
    const color = getHpColor();
    if (hpPercentage > 60) return `linear-gradient(180deg, #4ade80 0%, ${color} 100%)`;
    if (hpPercentage > 30) return `linear-gradient(180deg, #fde047 0%, ${color} 100%)`;
    return `linear-gradient(180deg, #f87171 0%, ${color} 100%)`;
  };
  
  return (
    <div style={styles.container}>
      {/* ボス名 */}
      <div style={styles.bossName}>
        <span style={styles.crown}>👑</span>
        <span style={styles.nameText}>KING DEDEDE</span>
        <span style={styles.crown}>👑</span>
      </div>
      
      {/* HPバー外枠 */}
      <div style={styles.barOuter}>
        {/* 装飾（左端） */}
        <div style={styles.decorLeft}>⚔️</div>
        
        {/* HPバー本体 */}
        <div style={styles.barContainer}>
          {/* 背景 */}
          <div style={styles.barBackground}>
            {/* HP量 */}
            <div 
              style={{
                ...styles.barFill,
                width: `${hpPercentage}%`,
                background: getHpGradient(),
              }}
            >
              {/* 光沢エフェクト */}
              <div style={styles.barShine} />
            </div>
            
            {/* ダメージ時の残像効果 */}
            <div 
              style={{
                ...styles.barDamage,
                width: `${hpPercentage}%`,
              }}
            />
          </div>
          
          {/* HP数値 */}
          <div style={styles.hpText}>
            {boss.hp} / {boss.maxHp}
          </div>
        </div>
        
        {/* 装飾（右端） */}
        <div style={styles.decorRight}>⚔️</div>
      </div>
      
      {/* ボスの状態表示 */}
      {boss.state === 'STUNNED' && (
        <div style={styles.statusBadge}>💫 STUNNED!</div>
      )}
      {boss.isDefeated && (
        <div style={styles.defeatedBadge}>🎉 DEFEATED! 🎉</div>
      )}
    </div>
  );
}

// スタイル定義
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 150,
    pointerEvents: 'none',
  },
  
  bossName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  
  crown: {
    fontSize: '20px',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
  },
  
  nameText: {
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fef08a',
    textShadow: `
      2px 2px 0 #1a1a3e,
      -2px -2px 0 #1a1a3e,
      2px -2px 0 #1a1a3e,
      -2px 2px 0 #1a1a3e,
      0 4px 8px rgba(0, 0, 0, 0.5)
    `,
    letterSpacing: '2px',
  },
  
  barOuter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  decorLeft: {
    fontSize: '24px',
    transform: 'scaleX(-1)',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
  },
  
  decorRight: {
    fontSize: '24px',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
  },
  
  barContainer: {
    position: 'relative',
    width: '400px',
    height: '32px',
  },
  
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #1a1a3e 0%, #2d2d5a 100%)',
    border: '3px solid #fef08a',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: `
      inset 0 2px 4px rgba(0, 0, 0, 0.5),
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(254, 240, 138, 0.3)
    `,
  },
  
  barFill: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    bottom: '2px',
    borderRadius: '12px',
    transition: 'width 0.3s ease-out',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
  },
  
  barShine: {
    position: 'absolute',
    top: '2px',
    left: '4px',
    right: '4px',
    height: '8px',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
    borderRadius: '8px',
  },
  
  barDamage: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    bottom: '2px',
    background: 'rgba(255, 0, 0, 0.3)',
    borderRadius: '12px',
    transition: 'width 0.5s ease-out 0.1s',
  },
  
  hpText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '10px',
    color: '#ffffff',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '1px',
  },
  
  statusBadge: {
    marginTop: '8px',
    padding: '4px 12px',
    background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
    borderRadius: '12px',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '10px',
    color: '#1a1a3e',
    fontWeight: 'bold',
    animation: 'pulse 0.5s infinite',
    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.5)',
  },
  
  defeatedBadge: {
    marginTop: '8px',
    padding: '8px 24px',
    background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
    borderRadius: '16px',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '12px',
    color: '#ffffff',
    fontWeight: 'bold',
    animation: 'bounce 0.5s infinite',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.5)',
  },
};

export default BossHPBar;
