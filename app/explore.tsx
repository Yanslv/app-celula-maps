import OfflineScreen from '@/components/OfflineScreen';
import PhotoUpload from '@/components/PhotoUpload';
import { bairrosVarzeaGrande, discipuladoOptions, redeOptions } from '@/constants/igrejavg';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { supabase } from '@/supabaseClient'; // Ajuste o caminho conforme seu projeto
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
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

// Função para buscar localização atual (acionada manualmente pelo usuário)
const getCurrentLocation = async (): Promise<{ lat: string; lng: string } | null> => {
  try {
    // Solicita permissão e obtém localização
    const { status } = await (await import('expo-location')).requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à localização para obter sua posição atual.');
      return null;
    }
    const location = await (await import('expo-location')).getCurrentPositionAsync({});
    return {
      lat: location.coords.latitude.toString(),
      lng: location.coords.longitude.toString(),
    };
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível obter a localização atual.');
    return null;
  }
};

const CadastroCelulaScreen = () => {
  const { isConnected, isLoading } = useNetworkStatus();
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

  // Estado para controlar busca manual de localização
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Validação simples
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Opções para os selects
  const publicoAlvoOptions = ['Adultos', 'Jovens', 'Adolescentes', 'Juvenis', 'Kids'];
  const diaSemanaOptions = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Busca automática removida - agora o usuário insere as coordenadas manualmente

  // Função para buscar localização quando o usuário clicar no botão
  const handleGetCurrentLocation = async () => {
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
    // Limpar erro do campo quando não estiver mais vazio
    if (validationErrors[field] && value.trim()) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      const extension = imageUri.split('.').pop() || 'jpg';
      const fileName = `celula_${Date.now()}.${extension}`;

      // No React Native, usar FormData com o URI da imagem
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: `image/${extension}`,
        name: fileName,
      } as any);

      // Upload para o Supabase usando FormData
      const { data, error } = await supabase.storage
        .from('lideres')
        .upload(fileName, formData, {
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

    } catch (err) {
      console.error('Erro no upload:', err);
      Alert.alert('Erro', 'Falha ao enviar foto. Verifique sua conexão.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectOption = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando uma opção for selecionada
    if (validationErrors[field] && value.trim()) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      // Limpar erro do campo horário quando um horário for selecionado
      if (validationErrors.horario) {
        setValidationErrors(prev => ({ ...prev, horario: '' }));
      }
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
              placeholderTextColor="#7f8c8d"
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

  // Função de validação simples
  const validateFormData = () => {
    const errors: Record<string, string> = {};

    if (!formData.nome_celula.trim()) {
      errors.nome_celula = 'Nome da célula é obrigatório';
    }
    if (!formData.nome_lider.trim()) {
      errors.nome_lider = 'Nome do líder é obrigatório';
    }
    if (!formData.celular_lider.trim()) {
      errors.celular_lider = 'Celular do líder é obrigatório';
    }
    if (!formData.bairro.trim()) {
      errors.bairro = 'Bairro é obrigatório';
    }
    if (!formData.rede.trim()) {
      errors.rede = 'Rede é obrigatória';
    }
    if (!formData.discipulado.trim()) {
      errors.discipulado = 'Discipulado é obrigatório';
    }
    if (!formData.publico_alvo.trim()) {
      errors.publico_alvo = 'Público alvo é obrigatório';
    }
    if (!formData.dia_da_semana.trim()) {
      errors.dia_da_semana = 'Dia da semana é obrigatório';
    }
    if (!formData.horario.trim()) {
      errors.horario = 'Horário é obrigatório';
    }
    if (!formData.lat.trim()) {
      errors.lat = 'Latitude é obrigatória';
    }
    if (!formData.lng.trim()) {
      errors.lng = 'Longitude é obrigatória';
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Verificar conectividade antes de enviar
    if (!isConnected) {
      Alert.alert('Sem Conexão', 'Você precisa estar conectado à internet para cadastrar uma célula.');
      return;
    }

    // Validar dados
    const errors = validateFormData();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      Alert.alert('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('celulas')
        .insert([
          {
            nome_celula: formData.nome_celula,
            nome_lider: formData.nome_lider,
            celular_lider: Number(formData.celular_lider.replace(/\D/g, '')),
            bairro: formData.bairro,
            rede: formData.rede,
            discipulado: formData.discipulado,
            publico_alvo: formData.publico_alvo,
            dia_da_semana: formData.dia_da_semana,
            horario: formData.horario,
            lat: Number(formData.lat),
            lng: Number(formData.lng),
            photo: formData.photo,
          }
        ]);

      if (error) throw error;

      Alert.alert('Sucesso', 'Célula cadastrada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.push('/'),
        },
      ]);

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

      // Resetar erros de validação
      setValidationErrors({});

      // Resetar flag de limpeza após um tempo
      setTimeout(() => setClearPhoto(false), 100);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar célula: ' + (error as Error).message);
    }
  };

  // Mostrar tela offline se não estiver conectado
  if (!isConnected && !isLoading) {
    return <OfflineScreen onRetry={() => router.back()} />;
  }

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Célula</Text>
          <TextInput
            style={[styles.input, validationErrors.nome_celula && styles.inputError]}
            placeholder="Nome da Célula"
            placeholderTextColor="#7f8c8d"
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
            placeholderTextColor="#7f8c8d"
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
            placeholderTextColor="#7f8c8d"
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

          {/* Botão para buscar localização atual */}
          <TouchableOpacity
            style={[
              styles.locationButton,
              isFetchingLocation && styles.buttonDisabled
            ]}
            onPress={handleGetCurrentLocation}
            disabled={isFetchingLocation}
          >
            <Text style={styles.locationButtonText}>
              {isFetchingLocation ? '📍 Obtendo localização...' : '📍 Usar Minha Localização'}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, validationErrors.lat && styles.inputError]}
            placeholder="Latitude (ex: -15.601481)"
            placeholderTextColor="#7f8c8d"
            value={formData.lat}
            onChangeText={(value) => handleInputChange('lat', value)}
            keyboardType="numeric"
          />
          {validationErrors.lat && (
            <Text style={styles.errorText}>{validationErrors.lat}</Text>
          )}

          <TextInput
            style={[styles.input, validationErrors.lng && styles.inputError]}
            placeholder="Longitude (ex: -56.097889)"
            placeholderTextColor="#7f8c8d"
            value={formData.lng}
            onChangeText={(value) => handleInputChange('lng', value)}
            keyboardType="numeric"
          />
          {validationErrors.lng && (
            <Text style={styles.errorText}>{validationErrors.lng}</Text>
          )}
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

        <TouchableOpacity
          style={[styles.button, uploadingPhoto && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={uploadingPhoto}
        >
          <Text style={styles.buttonText}>
            {uploadingPhoto ? 'Enviando foto...' : 'Cadastrar Célula'}
          </Text>
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
  buttonDisabled: {
    backgroundColor: '#b2bec3',
    shadowOpacity: 0,
    elevation: 0,
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
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    borderColor: '#e1e8ed',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
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
  locationHelpText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    textAlign: 'center',
  },
  locationTipContainer: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  locationTipText: {
    fontSize: 13,
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#27ae60',
    height: 45,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  orText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
});

export default CadastroCelulaScreen;