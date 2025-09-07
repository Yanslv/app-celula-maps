import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const URL_MAPS = 'https://maps-celulas.vercel.app/';

const MapsEmbed: React.FC = () => {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    // Esconde o header da tela
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    // Travar a orientação para paisagem ao entrar
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockOrientation();

    // Ao desmontar, voltar para orientação padrão (desbloquear)
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default MapsEmbed;
