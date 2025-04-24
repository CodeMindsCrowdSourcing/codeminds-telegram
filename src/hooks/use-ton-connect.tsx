import { useState, useEffect } from 'react';
import {
  TonConnect,
  Wallet,
  WalletConnectionSourceHTTP
} from '@tonconnect/sdk';

const manifestUrl = '/tonconnect-manifest.json';

export function useTonConnect() {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tonConnect] = useState(() => new TonConnect({ manifestUrl }));

  useEffect(() => {
    const unsubscribe = tonConnect.onStatusChange((wallet) => {
      setConnected(!!wallet);
      setWallet(wallet);
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnect]);

  const connect = () => {
    const wallet: WalletConnectionSourceHTTP = {
      bridgeUrl: manifestUrl,
      universalLink: manifestUrl
    };
    tonConnect.connect([wallet]);
  };

  const disconnect = () => {
    tonConnect.disconnect();
  };

  return {
    connect,
    disconnect,
    connected,
    wallet
  };
}
