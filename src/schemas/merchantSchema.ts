import { z } from 'zod';
import { cleanDigits, validateCNPJ } from '../utils/masks';

export const merchantRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .max(120, 'Nome muito longo'),
  email: z
    .string()
    .email('E-mail comercial inválido')
    .max(150, 'E-mail muito longo'),
  phone: z
    .string()
    .refine((val) => cleanDigits(val).length >= 10, {
      message: 'Telefone/WhatsApp deve conter DDD e pelo menos 10 dígitos',
    }),
  corporateReason: z
    .string()
    .min(3, 'Razão Social deve ter pelo menos 3 caracteres')
    .max(150, 'Razão Social muito longa'),
  cnpj: z
    .string()
    .refine((val) => cleanDigits(val).length === 14, {
      message: 'CNPJ deve conter 14 dígitos numéricos',
    })
    .refine((val) => validateCNPJ(val), {
      message: 'CNPJ inválido (dígitos verificadores incorretos)',
    }),
  storeName: z
    .string()
    .min(2, 'Nome da Loja deve ter pelo menos 2 caracteres')
    .max(120, 'Nome da Loja muito longo'),
  category: z
    .string()
    .min(2, 'Selecione uma categoria válida para a sua loja'),
  address: z.object({
    zipCode: z
      .string()
      .refine((val) => cleanDigits(val).length === 8, {
        message: 'CEP deve conter 8 dígitos',
      }),
    street: z
      .string()
      .min(3, 'Rua / Logradouro deve ter pelo menos 3 caracteres'),
    number: z
      .string()
      .min(1, 'Número do estabelecimento é obrigatório'),
    neighborhood: z
      .string()
      .min(2, 'Bairro é obrigatório'),
    city: z
      .string()
      .min(2, 'Cidade é obrigatória'),
    state: z
      .string()
      .length(2, 'Estado (UF) deve ter 2 letras'),
    complement: z.string().optional(),
  }),
  acceptedTerms: z.literal(true, {
    message: 'Você precisa aceitar os termos de intermediação para prosseguir.',
  }),
});

export type MerchantRegistrationFormData = z.infer<typeof merchantRegistrationSchema>;
