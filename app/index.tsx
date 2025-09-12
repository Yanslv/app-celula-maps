import OfflineScreen from '@/components/OfflineScreen';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const MapsVideiraSplash = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isConnected, isLoading } = useNetworkStatus();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatingAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Entrada da tela
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => setIsLoaded(true));

    // Animação de pulso do logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Animações flutuantes dos ícones
    floatingAnims.forEach((anim, index) => {
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
        ])
      );
      setTimeout(() => floatAnimation.start(), index * 1000);
    });

    return () => {
      pulseAnimation.stop();
      floatingAnims.forEach(anim => anim.stopAnimation());
    };
  }, []);

  const handleMaps = () => {
    // Navegação para a tab maps
    router.push('/maps');
  };

  const handleIniciar = () => {
    // Verificar conectividade antes de navegar
    if (!isConnected) {
      return; // Não navegar se estiver offline
    }
    // Navegação para a tab explore
    router.push('/explore');
  };

  const openSocialLink = (url: string) => {
    Linking.openURL(url);
  };

  interface FloatingIconProps {
    icon: string;
    library: 'MaterialCommunityIcons' | 'Ionicons';
    style: any;
    animIndex: number;
  }

  const FloatingIcon = ({ icon, library, style, animIndex }: FloatingIconProps) => {
    const translateY = floatingAnims[animIndex].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });

    const IconComponent = library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

    return (
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <IconComponent name={icon as any} size={24} color="rgba(52, 211, 153, 0.6)" />
      </Animated.View>
    );
  };

  const BackgroundPattern = () => (
    <View style={styles.backgroundPattern}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.patternCircle,
            {
              top: Math.random() * height,
              left: Math.random() * width,
              width: 60 + Math.random() * 80,
              height: 60 + Math.random() * 80,
            },
          ]}
        />
      ))}
    </View>
  );

  // Mostrar tela de carregamento enquanto verifica conectividade
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LinearGradient
          colors={['#064e3b', '#065f46', '#0f766e']}
          style={styles.container}
        >
          <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <MaterialCommunityIcons name="fruit-grapes" size={48} color="#ffffff" />
            </Animated.View>
            <Text style={styles.loadingText}>Verificando conexão...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Mostrar tela offline se não estiver conectado
  if (!isConnected) {
    return <OfflineScreen onRetry={() => {}} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#064e3b', '#065f46', '#0f766e']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#064e3b" translucent />

        <BackgroundPattern />

      {/* Ícones flutuantes */}
      <FloatingIcon
        icon="location"
        library="Ionicons"
        style={[styles.floatingIcon, { top: height * 0.2, left: width * 0.1 }]}
        animIndex={0}
      />
      <FloatingIcon
        icon="navigate"
        library="Ionicons"
        style={[styles.floatingIcon, { top: height * 0.3, right: width * 0.2 }]}
        animIndex={1}
      />
      <FloatingIcon
        icon="location-outline"
        library="Ionicons"
        style={[styles.floatingIcon, { bottom: height * 0.4, left: width * 0.15 }]}
        animIndex={2}
      />
      <FloatingIcon
        icon="compass-outline"
        library="Ionicons"
        style={[styles.floatingIcon, { bottom: height * 0.3, right: width * 0.15 }]}
        animIndex={3}
      />

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#4ade80', '#059669']}
              style={styles.logoBackground}
            >
              <MaterialCommunityIcons name="fruit-grapes" size={32} color="#ffffff" />
            </LinearGradient>
            <View style={styles.logoBadge}>
              <Ionicons name="location" size={10} color="#ffffff" />
            </View>
          </Animated.View>

          <Text style={styles.titleMain}>Maps</Text>
          <Text style={styles.titleSecondary}>Videira</Text>
          <Text style={styles.subtitle}>
            Cadastre sua célula para contribuir com o mapa
          </Text>
        </View>

        {/* Botões de ação */}
        <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
          <TouchableOpacity
            style={[styles.startButton, { width: '80%' }]}
            onPress={handleIniciar}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Cadastrar Célula</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, { marginTop: 8, width: '80%' }]}
            onPress={() => router.push('/maps')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6078be', '#5f2e80']}
              style={styles.buttonGradient}
            >
              <Ionicons name="map" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Ir para o Mapa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={styles.featureCard}>
              <Ionicons name="location" size={24} color="#6ee7b7" />
              <Text style={styles.featureTitle}>Localização</Text>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="navigate" size={24} color="#6ee7b7" />
              <Text style={styles.featureTitle}>Gestão</Text>
            </View>

            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="fruit-grapes" size={24} color="#6ee7b7" />
              <Text style={styles.featureTitle}>Facilidade</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => openSocialLink('https://github.com/yanslv')}
          >
            <Ionicons name="logo-github" size={20} color="#6ee7b7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => openSocialLink('https://linkedin.com/in/yantech')}
          >
            <Ionicons name="logo-linkedin" size={20} color="#6ee7b7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => openSocialLink('mailto:yan.amorim.tech@gmail.com')}
          >
            <Ionicons name="mail" size={20} color="#6ee7b7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => openSocialLink('https://wa.me/5565996128425')}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#6ee7b7" />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerTextMain}>
          <Text style={styles.footerTextBold}>Yan Amorim</Text> - Tech Developer
        </Text>
        <Text style={styles.footerTextSub}>
          Inovação • Tecnologia • Experiência do Usuário
        </Text>
      </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    borderColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 50,
  },
  floatingIcon: {
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 120, // Espaço para o footer
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  logoBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -1,
  },
  titleSecondary: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#a7f3d0',
    textAlign: 'center',
    letterSpacing: -1,
    marginTop: -6,
  },
  subtitle: {
    fontSize: 16,
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '300',
    lineHeight: 22,
    maxWidth: 280,
  },
  startButton: {
    marginBottom: 24,
    shadowColor: '#10b981',
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
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 22,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 350,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    flex: 1,
    marginHorizontal: 4,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  socialContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  socialIcon: {
    marginHorizontal: 6,
    padding: 6,
  },
  footerTextMain: {
    color: '#a7f3d0',
    fontSize: 12,
    textAlign: 'center',
  },
  footerTextBold: {
    fontWeight: '600',
  },
  footerTextSub: {
    color: 'rgba(167, 243, 208, 0.7)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});

export default MapsVideiraSplash;