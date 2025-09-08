import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar status inicial
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setIsLoading(false);
    });

    // Monitorar mudanças na conectividade
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isLoading,
    isOffline: isConnected === false,
  };
};
