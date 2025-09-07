import { GOOGLE_PLACES_API_KEY } from '@/config/googlePlaces';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface NeighborhoodSearchProps {
  onNeighborhoodSelected: (neighborhood: string) => void;
  placeholder?: string;
}

const { height } = Dimensions.get('window');

const NeighborhoodSearch: React.FC<NeighborhoodSearchProps> = ({
  onNeighborhoodSelected,
  placeholder = 'Digite o nome do bairro...',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Verificar se a API key está configurada
  const handleOpenSearch = () => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('YOUR_GOOGLE_PLACES_API_KEY')) {
      Alert.alert(
        'API Key não configurada',
        'A Google Places API key não está configurada. Entre em contato com o desenvolvedor.',
        [{ text: 'OK' }]
      );
      return;
    }
    setIsVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleOpenSearch}
      >
        <Text style={styles.searchButtonText}>🔍 Buscar Bairro</Text>
      </TouchableOpacity>

      <Text style={styles.description}>
        Toque para buscar bairros de Várzea Grande-MT
      </Text>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <GooglePlacesAutocomplete
              placeholder={placeholder}
              onPress={(data, details = null) => {
                console.log('Google Places data:', data);
                console.log('Google Places details:', details);
                
                // Verificar se details existe e tem address_components
                const addressComponents = details?.address_components;
                let neighborhood = '';

                if (addressComponents && Array.isArray(addressComponents)) {
                  for (const component of addressComponents) {
                    if (
                      component.types &&
                      Array.isArray(component.types) &&
                      (component.types.includes('sublocality_level_1') ||
                       component.types.includes('sublocality') ||
                       component.types.includes('neighborhood'))
                    ) {
                      neighborhood = component.long_name;
                      break;
                    }
                  }
                }

                // Fallback para o texto principal se não encontrar bairro
                if (!neighborhood && data?.structured_formatting?.main_text) {
                  neighborhood = data.structured_formatting.main_text;
                }

                // Fallback final para a descrição completa
                if (!neighborhood && data?.description) {
                  neighborhood = data.description.split(',')[0]; // Pega a primeira parte
                }

                console.log('Selected neighborhood:', neighborhood);
                
                if (neighborhood) {
                  onNeighborhoodSelected(neighborhood);
                  setIsVisible(false);
                } else {
                  console.warn('Não foi possível extrair o nome do bairro');
                  // Ainda assim fecha o modal e usa o que tiver
                  onNeighborhoodSelected(data?.description || 'Local selecionado');
                  setIsVisible(false);
                }
              }}
              onFail={(error) => {
                console.error('Google Places API Error:', error);
                Alert.alert(
                  'Erro na busca',
                  'Não foi possível buscar os bairros. Verifique sua conexão com a internet.',
                  [{ text: 'OK' }]
                );
              }}
              onNotFound={() => {
                console.log('Google Places: No results found');
              }}
              query={{
                key: GOOGLE_PLACES_API_KEY,
                language: 'pt-BR',
                components: 'country:br',
                types: '(regions)',
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              filterReverseGeocodingByTypes={['sublocality_level_1', 'sublocality', 'neighborhood']}
              debounce={300}
              minLength={2}
              listEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
                </View>
              )}
              textInputProps={{
                autoCorrect: false,
                autoCapitalize: 'words',
                returnKeyType: 'search',
              }}
              styles={{
                container: styles.autocompleteContainer,
                textInputContainer: styles.textInputContainer,
                textInput: styles.textInput,
                listView: styles.listView,
                row: styles.row,
              }}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  searchButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
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
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.7,
  },
  autocompleteContainer: {
    flex: 0,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e1e8ed',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#2c3e50',
    height: 44,
  },
  listView: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginTop: 8,
    maxHeight: 200,
  },
  row: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default NeighborhoodSearch;