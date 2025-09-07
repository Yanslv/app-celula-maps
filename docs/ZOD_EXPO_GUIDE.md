# Zod para Expo - Guia de Implementação

Este projeto implementa validação robusta com Zod especificamente otimizada para Expo/React Native.

## 🚀 Funcionalidades Implementadas

### 1. **Configuração Específica para Expo** (`config/expoZod.ts`)
- ✅ Mensagens de erro em português
- ✅ Validações específicas para Brasil (telefone, horário)
- ✅ Utilitários para coordenadas de mapas
- ✅ Validação de URLs de imagem do Expo
- ✅ Hook personalizado para validação em tempo real

### 2. **Schema de Validação** (`utils/validation.ts`)
- ✅ Validação completa do formulário de célula
- ✅ Hook `useFormValidation` otimizado para Expo
- ✅ Sanitização automática de dados
- ✅ Validação em tempo real

### 3. **Integração no Formulário** (`app/(tabs)/explore.tsx`)
- ✅ Validação automática no submit
- ✅ Feedback visual com bordas vermelhas
- ✅ Mensagens de erro específicas
- ✅ Limpeza automática de erros ao digitar

## 📋 Como Usar

### Validação Básica
```typescript
import { validateCelulaData } from '@/utils/validation';

const result = validateCelulaData(formData);
if (!result.success) {
  console.log('Erros:', result.errors);
}
```

### Hook de Validação
```typescript
import { useFormValidation } from '@/utils/validation';

const { errors, validateForm, clearFieldError } = useFormValidation(formData);

// Validar formulário completo
const validation = validateForm(formData);

// Limpar erro de campo específico
clearFieldError('nome_celula');
```

### Utilitários Específicos do Expo
```typescript
import { expoZodUtils } from '@/config/expoZod';

// Validação de telefone brasileiro
const phoneSchema = expoZodUtils.brazilianPhone;

// Validação de horário brasileiro
const timeSchema = expoZodUtils.brazilianTime;

// Validação de coordenadas
const coordsSchema = expoZodUtils.coordinates;
```

## 🎯 Validações Implementadas

| Campo | Validação | Mensagem de Erro |
|-------|-----------|------------------|
| Nome da Célula | 3-100 caracteres | "Nome da célula deve ter pelo menos 3 caracteres" |
| Nome do Líder | 2-100 caracteres | "Nome do líder deve ter pelo menos 2 caracteres" |
| Celular | 10-11 dígitos | "Telefone deve ter entre 10 e 11 dígitos" |
| Bairro | 1-50 caracteres | "Bairro é obrigatório" |
| Rede | 1-50 caracteres | "Rede é obrigatória" |
| Discipulado | 1-50 caracteres | "Discipulado é obrigatório" |
| Público Alvo | 1-50 caracteres | "Público alvo é obrigatório" |
| Dia da Semana | Obrigatório | "Dia da semana é obrigatório" |
| Horário | Formato HH:MM | "Horário deve estar no formato HH:MM" |
| Latitude | -90 a 90 | "Latitude deve ser um número entre -90 e 90" |
| Longitude | -180 a 180 | "Longitude deve ser um número entre -180 e 180" |
| Foto | URL válida | "URL da imagem deve ser válida" |

## 🔧 Configurações Específicas do Expo

### Mensagens de Erro Personalizadas
```typescript
// Configuração global de mensagens
z.setErrorMap(expoZodConfig.errorMap);
```

### Sanitização de Dados
```typescript
// Remove espaços em branco automaticamente
const sanitizedData = expoValidationUtils.sanitizeForExpo(formData);
```

### Validação de Coordenadas
```typescript
// Validação específica para mapas
const isValid = expoValidationUtils.validateCoordinates(lat, lng);
```

## 🚀 Benefícios da Implementação

1. **Performance**: Validação otimizada para React Native
2. **UX**: Feedback visual imediato
3. **Manutenibilidade**: Código organizado e reutilizável
4. **Localização**: Mensagens em português
5. **Flexibilidade**: Fácil de estender e modificar
6. **Compatibilidade**: Funciona perfeitamente com Expo

## 📱 Compatibilidade

- ✅ Expo SDK 53+
- ✅ React Native 0.79+
- ✅ TypeScript 5.8+
- ✅ Zod 4.1+

## 🔄 Fluxo de Validação

1. **Usuário digita** → Campo é validado em tempo real
2. **Erro detectado** → Borda vermelha + mensagem de erro
3. **Usuário corrige** → Erro desaparece automaticamente
4. **Submit** → Validação completa de todos os campos
5. **Dados válidos** → Envio para Supabase
6. **Dados inválidos** → Alert com instruções

Esta implementação garante dados consistentes e uma excelente experiência do usuário no seu app Expo! 🎉
