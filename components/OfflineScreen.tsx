import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const { width, height } = Dimensions.get('window');

interface OfflineScreenProps {
  onRetry?: () => void;
}

const OfflineScreen: React.FC<OfflineScreenProps> = ({ onRetry }) => {
  const { isConnected } = useNetworkStatus();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <LinearGradient
      colors={['#dc2626', '#b91c1c', '#991b1b']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Padrão de fundo */}
      <View style={styles.backgroundPattern}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternCircle,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                width: 40 + Math.random() * 60,
                height: 40 + Math.random() * 60,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.contentContainer}>
        {/* Ícone principal */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#fca5a5', '#f87171']}
            style={styles.iconBackground}
          >
            <Ionicons name="wifi-outline" size={48} color="#ffffff" />
            <View style={styles.offlineIndicator}>
              <Ionicons name="close" size={16} color="#dc2626" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Título e mensagem */}
        <Text style={styles.title}>Sem Conexão</Text>
        <Text style={styles.subtitle}>
          Este aplicativo precisa de uma conexão com a internet para funcionar.
        </Text>
        <Text style={styles.description}>
          Verifique sua conexão Wi-Fi ou dados móveis e tente novamente.
        </Text>

        {/* Status da conexão */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>
            {isConnected === null ? 'Verificando...' : isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>

        {/* Botão de tentar novamente */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f87171', '#dc2626']}
            style={styles.buttonGradient}
          >
            <Ionicons name="refresh" size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Dicas */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Dicas:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#fca5a5" />
            <Text style={styles.tipText}>Verifique se o Wi-Fi está ativo</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#fca5a5" />
            <Text style={styles.tipText}>Confirme se os dados móveis estão habilitados</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#fca5a5" />
            <Text style={styles.tipText}>Tente sair e entrar novamente no app</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  offlineIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#fca5a5',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: 'rgba(252, 165, 165, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 300,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    marginBottom: 40,
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 22,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  tipsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    color: 'rgba(252, 165, 165, 0.9)',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default OfflineScreen;
