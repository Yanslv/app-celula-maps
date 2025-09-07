import { GOOGLE_PLACES_API_KEY } from '@/config/googlePlaces';
import React, { useState } from 'react';
import {
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
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setIsVisible(true)}
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
                console.log(data, details);
                // Extrair apenas o nome do bairro
                const addressComponents = details?.address_components || [];
                let neighborhood = '';
                
                // Procurar pelo componente "sublocality" ou "neighborhood"
                for (const component of addressComponents) {
                  console.log(component);
                  if (component.types.includes('sublocality') || 
                      component.types.includes('neighborhood') ||
                      component.types.includes('sublocality_level_1')) {
                    neighborhood = component.long_name;
                    break;
                  }
                }
                
                // Se não encontrar, usar o nome principal
                if (!neighborhood) {
                  neighborhood = data.structured_formatting.main_text;
                }
                
                onNeighborhoodSelected(neighborhood);
                setIsVisible(false);
              }}
              query={{
                key: GOOGLE_PLACES_API_KEY,
                language: 'pt-BR',
                components: 'country:br',
                types: '',
              }}
              styles={{
                container: styles.autocompleteContainer,
                textInputContainer: styles.textInputContainer,
                textInput: styles.textInput,
                listView: styles.listView,
                row: styles.row,
                description: styles.description,
              }}
              textInputProps={{
                placeholderTextColor: '#95a5a6',
              }}
              enablePoweredByContainer={false}
              fetchDetails={true}
              filterReverseGeocodingByTypes={[
                'locality',
                'administrative_area_level_3',
              ]}
              predefinedPlaces={[
                {
                  description: 'Várzea Grande, MT, Brasil',
                  geometry: { location: { lat: -15.6511, lng: -56.1325 } },
                },
              ]}
              predefinedPlacesAlwaysVisible={true}
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
});

export default NeighborhoodSearch;