import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MapsLatLgnProps {
  onLocationFound: (latitude: number, longitude: number) => void;
}

const MapsLatLgn: React.FC<MapsLatLgnProps> = ({ onLocationFound }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // Solicitar permissão para acessar a localização
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'É necessário permitir o acesso à localização para usar esta funcionalidade.'
        );
        return;
      }

      // Obter a localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Chamar a função callback com as coordenadas
      onLocationFound(latitude, longitude);

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={getCurrentLocation}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>📍 Buscar Minha Localização</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.description}>
        Toque no botão para obter automaticamente sua latitude e longitude
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    shadowColor: '#95a5a6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default MapsLatLgn;
