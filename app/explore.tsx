import PhotoUpload from '@/components/PhotoUpload';
import { bairrosVarzeaGrande, discipuladoOptions, redeOptions } from '@/constants/igrejavg';
import { supabase } from '@/supabaseClient'; // Ajuste o caminho conforme seu projeto
import { expoValidationUtils, useFormValidation } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Função utilitária para buscar localização atual
const getCurrentLocation = async (): Promise<{ lat: string; lng: string } | null> => {
  try {
    // Solicita permissão e obtém localização
    const { status } = await (await import('expo-location')).requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à localização para cadastrar a célula.');
      return null;
    }
    const location = await (await import('expo-location')).getCurrentPositionAsync({});
    return {
      lat: location.coords.latitude.toString(),
      lng: location.coords.longitude.toString(),
    };
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível obter a localização automaticamente.');
    return null;
  }
};

const CadastroCelulaScreen = () => {
  const [formData, setFormData] = useState({
    nome_celula: '',
    nome_lider: '',
    celular_lider: '',
    bairro: '',
    rede: '',
    discipulado: '',
    publico_alvo: '',
    dia_da_semana: '',
    horario: '',
    lat: '',
    lng: '',
    photo: '',
  });

  // Estados para os modais dos selects
  const [showPublicoAlvoModal, setShowPublicoAlvoModal] = useState(false);
  const [showBairroModal, setShowBairroModal] = useState(false);
  const [showRedeModal, setShowRedeModal] = useState(false);
  const [showDiscipuladoModal, setShowDiscipuladoModal] = useState(false);
  const [showDiaSemanaModal, setShowDiaSemanaModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [clearPhoto, setClearPhoto] = useState(false);

  // Estado para controlar se está buscando localização manualmente
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Hook de validação personalizado para Expo
  const { errors: validationErrors, validateForm, clearFieldError } = useFormValidation();

  // Opções para os selects
  const publicoAlvoOptions = ['Adultos', 'Jovens', 'Adolescentes', 'Juvenis', 'Kids'];
  const diaSemanaOptions = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Busca automática da localização ao montar o componente
  useEffect(() => {
    (async () => {
      setIsFetchingLocation(true);
      const loc = await getCurrentLocation();
      if (loc) {
        setFormData(prev => ({
          ...prev,
          lat: loc.lat,
          lng: loc.lng,
        }));
      }
      setIsFetchingLocation(false);
    })();
  }, []);

  // Função para forçar a busca manual da localização
  const handleForceLocation = async () => {
    setIsFetchingLocation(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setFormData(prev => ({
        ...prev,
        lat: loc.lat,
        lng: loc.lng,
      }));
    }
    setIsFetchingLocation(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    clearFieldError(field);
  };

  const handleNeighborhoodSelected = (neighborhood: string) => {
    setFormData(prev => ({
      ...prev,
      bairro: neighborhood,
    }));
  };

  const handlePhotoUploaded = async (imageUri: string) => {
    setUploadingPhoto(true);

    try {
      // Ler arquivo como Base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Converter Base64 para Uint8Array
      const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const extension = imageUri.split('.').pop() || 'jpg';
      const fileName = `celula_${Date.now()}.${extension}`;

      // Upload para o Supabase
      const { data, error } = await supabase.storage
        .from('lideres')
        .upload(fileName, binary, {
          contentType: `image/${extension}`,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage.from('lideres').getPublicUrl(fileName);
      const imageUrl = publicUrlData.publicUrl;

      // Atualizar o formulário com a URL da imagem
      setFormData(prev => ({
        ...prev,
        photo: imageUrl,
      }));

      Alert.alert('Sucesso!', 'Foto enviada com sucesso!');

    } catch (err) {
      console.error('Erro no upload:', err);
      Alert.alert('Erro', 'Falha ao enviar foto. Verifique sua conexão.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectOption = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setFormData(prev => ({ ...prev, horario: timeString }));
    }
  };

  const renderSelectModal = (
    visible: boolean,
    onClose: () => void,
    options: string[],
    field: string,
    title: string
  ) => {
    const [filter, setFilter] = useState('');
    // Filtra as opções conforme o texto digitado

    const filteredOptions = options.filter(opt =>
      opt.toLowerCase().includes(filter.toLowerCase())
    );


    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 320 }]}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TextInput
              style={styles.modalFilterInput}
              placeholder="Filtrar..."
              placeholderTextColor="#aaa"
              value={filter}
              onChangeText={setFilter}
              autoFocus
            />
            <ScrollView>
              {filteredOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalOption}
                  onPress={() => {
                    handleSelectOption(field, item);
                    onClose();
                  }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSubmit = async () => {
    // Sanitizar dados para Expo
    const sanitizedData = expoValidationUtils.sanitizeForExpo(formData);

    // Validar dados com Zod usando o hook
    const validation = validateForm(sanitizedData);

    if (!validation.success) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os campos destacados em vermelho.');
      return;
    }

    try {
      // Garantir que validation.data não é null
      const validatedData = validation.data!;

      const { data, error } = await supabase
        .from('celulas')
        .insert([
          {
            nome_celula: validatedData.nome_celula,
            nome_lider: validatedData.nome_lider,
            celular_lider: Number(validatedData.celular_lider.replace(/\D/g, '')),
            bairro: validatedData.bairro,
            rede: validatedData.rede,
            discipulado: validatedData.discipulado,
            publico_alvo: validatedData.publico_alvo,
            dia_da_semana: validatedData.dia_da_semana,
            horario: validatedData.horario,
            lat: Number(validatedData.lat),
            lng: Number(validatedData.lng),
            photo: validatedData.photo,
          }
        ]);

      if (error) throw error;

      Alert.alert('Sucesso', 'Célula cadastrada com sucesso!');

      // Limpar foto no componente
      setClearPhoto(true);

      // Limpar formulário
      setFormData({
        nome_celula: '',
        nome_lider: '',
        celular_lider: '',
        bairro: '',
        rede: '',
        discipulado: '',
        publico_alvo: '',
        dia_da_semana: '',
        horario: '',
        lat: '',
        lng: '',
        photo: '',
      });

      // Resetar flag de limpeza após um tempo
      setTimeout(() => setClearPhoto(false), 100);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar célula: ' + (error as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>Cadastro de Célula</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Debug visual dos erros */}
        {Object.keys(validationErrors).length > 0 && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>🔍 Erros Detectados:</Text>
            {Object.entries(validationErrors).map(([field, error]) => (
              <Text key={field} style={styles.debugText}>
                {field}: {error}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Célula</Text>
          <TextInput
            style={[styles.input, validationErrors.nome_celula && styles.inputError]}
            placeholder="Nome da Célula"
            value={formData.nome_celula}
            onChangeText={(value) => handleInputChange('nome_celula', value)}
          />
          {validationErrors.nome_celula && (
            <Text style={styles.errorText}>{validationErrors.nome_celula}</Text>
          )}
          {/* <NeighborhoodSearch
            onNeighborhoodSelected={handleNeighborhoodSelected}
            placeholder="Digite o nome do bairro..."
          /> */}
          <TouchableOpacity
            style={[styles.selectInput, validationErrors.rede && styles.inputError]}
            onPress={() => setShowRedeModal(true)}
          >
            <Text style={[styles.selectText, !formData.rede && styles.placeholderText]}>
              {formData.rede || 'Selecione a Rede'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {validationErrors.rede && (
            <Text style={styles.errorText}>{validationErrors.rede}</Text>
          )}
          <TouchableOpacity
            style={[styles.selectInput, validationErrors.bairro && styles.inputError]}
            onPress={() => setShowBairroModal(true)}
          >
            <Text style={[styles.selectText, !formData.bairro && styles.placeholderText]}>
              {formData.bairro || 'Selecione o Bairro'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {validationErrors.bairro && (
            <Text style={styles.errorText}>{validationErrors.bairro}</Text>
          )}
          <TouchableOpacity
            style={[styles.selectInput, validationErrors.discipulado && styles.inputError]}
            onPress={() => setShowDiscipuladoModal(true)}
          >
            <Text style={[styles.selectText, !formData.discipulado && styles.placeholderText]}>
              {formData.discipulado || 'Selecione o Discipulado'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {validationErrors.discipulado && (
            <Text style={styles.errorText}>{validationErrors.discipulado}</Text>
          )}
          <TouchableOpacity
            style={[styles.selectInput, validationErrors.publico_alvo && styles.inputError]}
            onPress={() => setShowPublicoAlvoModal(true)}
          >
            <Text style={[styles.selectText, !formData.publico_alvo && styles.placeholderText]}>
              {formData.publico_alvo || 'Selecione o Público Alvo'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {validationErrors.publico_alvo && (
            <Text style={styles.errorText}>{validationErrors.publico_alvo}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horário e Dia da Célula</Text>
          <TouchableOpacity
            style={[styles.selectInput, validationErrors.dia_da_semana && styles.inputError]}
            onPress={() => setShowDiaSemanaModal(true)}
          >
            <Text style={[styles.selectText, !formData.dia_da_semana && styles.placeholderText]}>
              {formData.dia_da_semana || 'Selecione o Dia da Semana'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {validationErrors.dia_da_semana && (
            <Text style={styles.errorText}>{validationErrors.dia_da_semana}</Text>
          )}
          <TouchableOpacity
            style={[styles.selectInput, validationErrors.horario && styles.inputError]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.selectText, !formData.horario && styles.placeholderText]}>
              {formData.horario || 'Selecione o Horário'}
            </Text>
            <Text style={styles.selectArrow}>🕐</Text>
          </TouchableOpacity>
          {validationErrors.horario && (
            <Text style={styles.errorText}>{validationErrors.horario}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Líder</Text>
          <TextInput
            style={[styles.input, validationErrors.nome_lider && styles.inputError]}
            placeholder="Nome do Líder"
            value={formData.nome_lider}
            onChangeText={(value) => handleInputChange('nome_lider', value)}
          />
          {validationErrors.nome_lider && (
            <Text style={styles.errorText}>{validationErrors.nome_lider}</Text>
          )}
          <TextInput
            maxLength={15}
            style={[styles.input, validationErrors.celular_lider && styles.inputError]}
            placeholder="Celular do Líder"
            value={formData.celular_lider}
            onChangeText={(value) => {
              let cleaned = value.replace(/\D/g, '');
              let masked = cleaned;
              if (cleaned.length > 2 && cleaned.length <= 7) {
                masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
              } else if (cleaned.length > 7) {
                masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
              } else if (cleaned.length > 0 && cleaned.length <= 2) {
                masked = `(${cleaned}`;
              }
              handleInputChange('celular_lider', masked);
            }}
            keyboardType="numeric"
          />
          {validationErrors.celular_lider && (
            <Text style={styles.errorText}>{validationErrors.celular_lider}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          {/* Busca automática da localização, com botão para forçar busca caso falhe */}
          {formData.lat && formData.lng ? (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 14 }}>
                Localização detectada automaticamente!
              </Text>
              <Text style={{ color: '#34495e', fontSize: 13 }}>
                Latitude: {formData.lat}
              </Text>
              <Text style={{ color: '#34495e', fontSize: 13 }}>
                Longitude: {formData.lng}
              </Text>
            </View>
          ) : (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#e67e22', fontSize: 13, marginBottom: 6 }}>
                {isFetchingLocation
                  ? 'Buscando localização automática...'
                  : 'Não foi possível obter a localização automaticamente.'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isFetchingLocation ? '#b2bec3' : '#27ae60', marginTop: 0, height: 40 }
                ]}
                onPress={handleForceLocation}
                disabled={isFetchingLocation}
              >
                <Text style={styles.buttonText}>
                  {isFetchingLocation ? 'Buscando localização...' : 'Tentar novamente'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Nenhum botão ou input de lat/lng além do botão de forçar busca */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto</Text>
          <PhotoUpload
            onPhotoSelected={handlePhotoUploaded}
            placeholder="Selecione uma foto para a célula"
            clearImage={clearPhoto}
          />
          {validationErrors.photo && (
            <Text style={styles.errorText}>{validationErrors.photo}</Text>
          )}
          {uploadingPhoto && (
            <View style={styles.uploadingContainer}>
              <Text style={styles.uploadingText}>📤 Enviando foto...</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Cadastrar Célula</Text>
        </TouchableOpacity>

        {/* Modais dos Selects */}
        {renderSelectModal(
          showPublicoAlvoModal,
          () => setShowPublicoAlvoModal(false),
          publicoAlvoOptions,
          'publico_alvo',
          'Selecione o Público Alvo'
        )}

        {renderSelectModal(
          showBairroModal,
          () => setShowBairroModal(false),
          bairrosVarzeaGrande,
          'bairro',
          'Selecione o bairro'
        )}

        {renderSelectModal(
          showRedeModal,
          () => setShowRedeModal(false),
          redeOptions,
          'rede',
          'Selecione a Rede'
        )}

        {renderSelectModal(
          showDiscipuladoModal,
          () => setShowDiscipuladoModal(false),
          discipuladoOptions,
          'discipulado',
          'Selecione o Discipulado'
        )}

        {renderSelectModal(
          showDiaSemanaModal,
          () => setShowDiaSemanaModal(false),
          diaSemanaOptions,
          'dia_da_semana',
          'Selecione o Dia da Semana'
        )}

        {/* DateTimePicker para Horário */}
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    marginTop: 30,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSpacer: {
    width: 40, // Mesmo tamanho do botão para centralizar o título
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#f8f9fa',
    borderColor: '#e1e8ed',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#532f6c',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectInput: {
    height: 44,
    backgroundColor: '#f8f9fa',
    borderColor: '#e1e8ed',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  placeholderText: {
    color: '#95a5a6',
  },
  selectArrow: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalFilterInput: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    borderColor: '#e1e8ed',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  selectedNeighborhood: {
    backgroundColor: '#d5f4e6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  selectedNeighborhoodText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadingContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  uploadingText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});

export default CadastroCelulaScreen;