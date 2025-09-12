import OfflineScreen from '@/components/OfflineScreen';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const URL_MAPS = 'https://maps-celulas.vercel.app/';

const MapsEmbed: React.FC = () => {
  const navigation = useNavigation();
  const { isConnected, isLoading } = useNetworkStatus();
  const [isLandscape, setIsLandscape] = useState(false);

  React.useLayoutEffect(() => {
    // Esconde o header da tela
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    // Ao desmontar, desbloquear orientação para voltar ao padrão
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const toggleOrientation = async () => {
    try {
      if (isLandscape) {
        // Voltar para retrato
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        // Ir para paisagem
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch (error) {
      console.error('Erro ao alterar orientação:', error);
    }
  };

  // Mostrar tela offline se não estiver conectado
  if (!isConnected && !isLoading) {
    return <OfflineScreen onRetry={() => navigation.goBack()} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <WebView
          source={{ uri: URL_MAPS }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#065f46" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  backButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  rotateButton: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
  },
});

export default MapsEmbed;
