'use client';

import dynamic from 'next/dynamic';

const TonConnectProvider = dynamic(
  () => import('./TonConnectProvider').then((mod) => mod.TonConnectProvider),
  { ssr: false }
);

export function DynamicTonConnectProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return <TonConnectProvider>{children}</TonConnectProvider>;
}
