import { useState, useEffect } from 'react';
import type { Wallet, WalletConnectionSourceHTTP } from '@tonconnect/sdk';

const manifestUrl = 'https://chanage.org/manifest.json';

export function useTonConnect() {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tonConnect, setTonConnect] = useState<any>(null);

  useEffect(() => {
    const initTonConnect = async () => {
      const { TonConnect } = await import('@tonconnect/sdk');
      const tonConnectInstance = new TonConnect({ manifestUrl });
      setTonConnect(tonConnectInstance);

      const unsubscribe = tonConnectInstance.onStatusChange((wallet) => {
        setConnected(!!wallet);
        setWallet(wallet);
      });

      return () => {
        unsubscribe();
      };
    };

    initTonConnect();
  }, []);

  const connect = async () => {
    if (!tonConnect) return;

    const wallet: WalletConnectionSourceHTTP = {
      bridgeUrl: manifestUrl,
      universalLink: manifestUrl
    };
    tonConnect.connect([wallet]);
  };

  const disconnect = () => {
    if (!tonConnect) return;
    tonConnect.disconnect();
  };

  return {
    connect,
    disconnect,
    connected,
    wallet
  };
}
