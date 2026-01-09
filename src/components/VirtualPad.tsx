/**
 * バーチャルパッドコンポーネント
 * ジョイスティックとボタンを統合
 */

import React from 'react';
import { VirtualJoystick } from './VirtualJoystick';
import { ActionButtons } from './ActionButtons';

interface VirtualPadProps {
  visible?: boolean;
}

export const VirtualPad: React.FC<VirtualPadProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '20px 30px',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* 左側：ジョイスティック */}
      <div style={{ pointerEvents: 'auto' }}>
        <VirtualJoystick />
      </div>

      {/* 右側：アクションボタン */}
      <div style={{ pointerEvents: 'auto' }}>
        <ActionButtons />
      </div>
    </div>
  );
};
