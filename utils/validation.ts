import { expoZodUtils } from '@/config/expoZod';
import { useCallback, useState } from 'react';
import { z } from 'zod';

// Schema de validação para o cadastro de célula usando utilitários do Expo
export const celulaSchema = z.object({
  nome_celula: expoZodUtils.requiredString('Nome da célula', 3, 100),
  nome_lider: expoZodUtils.requiredString('Nome do líder', 2, 100),
  celular_lider: expoZodUtils.brazilianPhone,
  bairro: expoZodUtils.requiredString('Bairro', 1, 50),
  rede: expoZodUtils.requiredString('Rede', 1, 50),
  discipulado: expoZodUtils.requiredString('Discipulado', 1, 50),
  publico_alvo: expoZodUtils.requiredString('Público alvo', 1, 50),
  dia_da_semana: expoZodUtils.requiredSelection('Dia da semana'),
  horario: expoZodUtils.brazilianTime,
  lat: z.string().min(1, 'Latitude é obrigatória').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, 'Latitude deve ser um número entre -90 e 90'),
  lng: z.string().min(1, 'Longitude é obrigatória').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, 'Longitude deve ser um número entre -180 e 180'),
  photo: z.string().min(1, 'Foto é obrigatória').url('URL da foto deve ser válida'),
});

// Tipo inferido do schema
export type CelulaFormData = z.infer<typeof celulaSchema>;

// Resultado da validação
export interface ValidationResult {
  success: boolean;
  data: CelulaFormData | null;
  errors: Record<string, string> | null;
}

// Função para validar os dados do formulário
export const validateCelulaData = (data: any): ValidationResult => {
  try {
    const validatedData = celulaSchema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('validateCelulaData - ZodError:', error);
      console.log('validateCelulaData - errors array:', error.errors);
      
      // Verificar se error.errors existe e é um array
      if (error.errors && Array.isArray(error.errors)) {
        const errors = error.errors.reduce((acc, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        return { success: false, data: null, errors };
      } else {
        console.log('validateCelulaData - Error.errors is not an array:', error.errors);
        return { success: false, data: null, errors: { general: 'Erro de validação' } };
      }
    }
    console.log('validateCelulaData - Non-ZodError:', error);
    return { success: false, data: null, errors: { general: 'Erro de validação desconhecido' } };
  }
};

// Hook personalizado para validação em tempo real (otimizado para Expo/Hermes)
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validação completa do formulário
  const validateFormData = useCallback((data: any): ValidationResult => {
    setIsValidating(true);
    
    try {
      const validatedData = celulaSchema.parse(data);
      setErrors({});
      setIsValidating(false);
      return { success: true, data: validatedData, errors: null };
    } catch (error) {
      console.log('Validation error caught:', error);
      
      // Tratamento mais robusto para diferentes tipos de erro
      let errorMessages: Record<string, string> = {};
      
      if (error && typeof error === 'object') {
        // Verificar se é um ZodError
        if (error.constructor && error.constructor.name === 'ZodError') {
          console.log('Detected ZodError');
          
          // Tentar acessar errors de forma mais segura
          const errorArray = (error as any).errors;
          console.log('Error array:', errorArray);
          
          if (errorArray && typeof errorArray === 'object') {
            // Converter para array se necessário
            const errorsList = Array.isArray(errorArray) ? errorArray : Object.values(errorArray);
            
            errorsList.forEach((err: any) => {
              if (err && err.path && err.message) {
                const field = err.path[0];
                if (field) {
                  errorMessages[field] = err.message;
                }
              }
            });
          }
        } else {
          console.log('Non-ZodError detected:', error.constructor?.name);
          errorMessages = { general: 'Erro de validação' };
        }
      } else {
        console.log('Unknown error type:', typeof error);
        errorMessages = { general: 'Erro de validação desconhecido' };
      }
      
      console.log('Final error messages:', errorMessages);
      setErrors(errorMessages);
      setIsValidating(false);
      return { success: false, data: null, errors: errorMessages };
    }
  }, []);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Limpar erro de campo específico
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValidating,
    validateForm: validateFormData,
    clearErrors,
    clearFieldError,
  };
};

// Utilitários específicos para Expo
export const expoValidationUtils = {
  // Validação de URL de imagem do Expo
  validateImageUrl: (url: string): boolean => {
    try {
      const urlSchema = z.string().url();
      urlSchema.parse(url);
      return true;
    } catch {
      return false;
    }
  },

  // Validação de coordenadas para mapas
  validateCoordinates: (lat: string, lng: string): boolean => {
    try {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      return !isNaN(latNum) && !isNaN(lngNum) && 
             latNum >= -90 && latNum <= 90 && 
             lngNum >= -180 && lngNum <= 180;
    } catch {
      return false;
    }
  },

  // Validação de telefone brasileiro
  validateBrazilianPhone: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },

  // Sanitização de dados para Expo
  sanitizeForExpo: (data: any): any => {
    return Object.keys(data).reduce((acc, key) => {
      const value = data[key];
      if (typeof value === 'string') {
        acc[key] = value.trim();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  },
};