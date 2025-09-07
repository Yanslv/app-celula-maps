// Configuração específica do Zod para Expo
import { z } from 'zod';

// Configuração global do Zod para Expo
export const expoZodConfig = {
  // Configurações específicas para React Native/Expo
  errorMap: (issue: z.ZodIssueOptionalMessage, ctx: z.ErrorMapCtx) => {
    // Personalizar mensagens de erro para Expo
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.expected === 'string') {
          return { message: 'Este campo deve ser um texto' };
        }
        if (issue.expected === 'number') {
          return { message: 'Este campo deve ser um número' };
        }
        break;
      case z.ZodIssueCode.too_small:
        if (issue.type === 'string') {
          return { message: `Mínimo de ${issue.minimum} caracteres` };
        }
        break;
      case z.ZodIssueCode.too_big:
        if (issue.type === 'string') {
          return { message: `Máximo de ${issue.maximum} caracteres` };
        }
        break;
      case z.ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          return { message: 'Email inválido' };
        }
        if (issue.validation === 'url') {
          return { message: 'URL inválida' };
        }
        break;
    }
    return { message: ctx.defaultError };
  },
};

// Aplicar configuração global
z.setErrorMap(expoZodConfig.errorMap);

// Utilitários específicos para Expo
export const expoZodUtils = {
  // Validação de coordenadas para mapas do Expo
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  // Validação de telefone brasileiro
  brazilianPhone: z.string().refine((phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }, 'Telefone deve ter entre 10 e 11 dígitos'),

  // Validação de horário brasileiro
  brazilianTime: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Horário deve estar no formato HH:MM'
  ),

  // Validação de URL de imagem do Expo
  expoImageUrl: z.string().url('URL da imagem deve ser válida'),

  // Validação de texto com trim automático
  trimmedString: (min: number = 1, max: number = 255) =>
    z.string().trim().min(min, `Mínimo de ${min} caracteres`).max(max, `Máximo de ${max} caracteres`),

  // Validação de campos obrigatórios com mensagens em português
  requiredString: (fieldName: string, min: number = 1, max: number = 255) =>
    z.string()
      .trim()
      .min(min, `${fieldName} deve ter pelo menos ${min} caracteres`)
      .max(max, `${fieldName} deve ter no máximo ${max} caracteres`),

  // Validação de seleção obrigatória
  requiredSelection: (fieldName: string) =>
    z.string().min(1, `${fieldName} é obrigatório`),
};

// Hook personalizado para validação em tempo real no Expo
export const useExpoValidation = () => {
  const validateField = (schema: z.ZodSchema, value: any) => {
    try {
      schema.parse(value);
      return { success: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message || 'Campo inválido' };
      }
      return { success: false, error: 'Erro de validação' };
    }
  };

  const validateForm = (schema: z.ZodSchema, data: any) => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: { general: 'Erro de validação' } };
    }
  };

  return { validateField, validateForm };
};

export default expoZodConfig;
