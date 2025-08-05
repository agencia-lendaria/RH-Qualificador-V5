export type Service = 'agente-sdr' | 'agente-closer';
export type PaymentMethod = 'credit-card' | 'bank-transfer' | 'pix' | 'bank-slip';
export type ContractDuration = '12';

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ServiceConfig {
  serviceType: Service;
  serviceTypeName: string;
  customServiceName?: string;
  baseValue: number;
  quantity: number;
  recurring: boolean;
  recurringValue?: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  customInterest?: number;
  cashDiscount?: number;
  contractDuration: ContractDuration;
  contractDiscount?: number;
  colorTheme?: ColorTheme;
}

export interface PersonalData {
  name: string;
  whatsapp: string;
  email: string;
  budget?: number;
  agencyName?: string;
  logoFile?: File;
  logoDataUrl?: string;
}

export interface IncludedItem {
  id: string;
  label: string;
  custom: boolean;
  price?: number;
  isRecurring: boolean;
  required?: boolean;
}

// Alias for compatibility
export type FormData = PersonalData;

export const SERVICE_TYPES: Record<Service, string> = {
  'agente-sdr': 'Agente SDR',
  'agente-closer': 'Agente Closer'
};

export const SERVICE_DESCRIPTIONS: Record<Service, string> = {
  'agente-sdr': 'Prospecção e qualificação automatizada de vendas com plataforma completa e data analytics',
  'agente-closer': 'Automação de fechamento de negócios com plataforma completa, data analytics e recursos avançados para reuniões'
};



export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  'credit-card': 'Cartão de Crédito',
  'bank-transfer': 'Transferência Bancária',
  'pix': 'PIX',
  'bank-slip': 'Boleto Bancário'
};

export const CONTRACT_DURATIONS: Record<ContractDuration, string> = {
  '12': '12 meses'
};

export const DEFAULT_INCLUDED_ITEMS: IncludedItem[] = [
  { id: '1', label: 'Integração com WhatsApp da empresa', custom: false, isRecurring: false, price: 2000 },
  { id: '2', label: 'Integração com Planilha', custom: false, isRecurring: false, price: 1500 },
  { id: '3', label: 'Integração Avançada com CRM', custom: false, isRecurring: false, price: 2500 },
  { id: '4', label: 'Integração com 3 Ferramentas externas', custom: false, isRecurring: false, price: 4000 },
  { id: '5', label: 'Dashboard de Métricas', custom: false, isRecurring: true, price: 500 },
  { id: '6', label: 'Relatórios Semanais', custom: false, isRecurring: true, price: 400 },
  { id: '7', label: 'Gravação e Avaliação de Reuniões', custom: false, isRecurring: true, price: 600 },
  { id: '8', label: 'Grupo de Suporte dedicado', custom: false, isRecurring: true, price: 500, required: true },
  { id: '9', label: 'Manutenções Técnicas', custom: false, isRecurring: true, price: 800, required: true },
  { id: '10', label: 'Acesso às Novas Atualizações de Performance', custom: false, isRecurring: true, price: 700, required: true }
];



// 🏆 1. Tema Lendário - Academia Lendária (Padrão) - Atualizado conforme especificação
export const LEGENDARY_THEME: ColorTheme = {
  primary: '#BEB484',      // Cor de acento CTA
  secondary: '#BEB484',    // Mesma cor para consistência
  accent: '#BEB484',       // Cor de acento CTA
  background: '#161616',   // Fundo principal escuro
  surface: '#242424',      // Superfície cinza escuro
  text: '#FFFFFF',         // Texto principal branco
  textSecondary: '#B8B8B8', // Texto secundário cinza claro
  border: '#484848'        // Bordas e foco
};

// 💼 2. Tema Profissional - Azul e Marrom
export const PROFESSIONAL_THEME: ColorTheme = {
  primary: '#002D5A',      // Azul escuro
  secondary: '#8B4513',    // Marrom escuro
  accent: '#002D5A',       // Azul escuro (mesmo que primary)
  background: '#FFFFFF',   // Fundo branco
  surface: '#F8FAFC',      // Superfície azul muito claro
  text: '#1A202C',         // Texto cinza escuro
  textSecondary: '#2D3748', // Texto secundário cinza médio
  border: '#E2E8F0'        // Borda cinza claro
};

// ✨ 3. Tema Elegante - Verde Escuro e Azul Marinho
export const ELEGANT_THEME: ColorTheme = {
  primary: '#2F4F4F',      // Verde escuro (Dark Slate Gray)
  secondary: '#000080',    // Azul marinho (Navy)
  accent: '#2F4F4F',       // Verde escuro (mesmo que primary)
  background: '#FFFFFF',   // Fundo branco
  surface: '#F8FAFC',      // Superfície cinza muito claro
  text: '#1A202C',         // Texto cinza escuro
  textSecondary: '#2D3748', // Texto secundário cinza médio
  border: '#E2E8F0'        // Borda cinza claro
};

// 🌿 4. Tema Natural - Verde Escuro e Verde Médio
export const NATURAL_THEME: ColorTheme = {
  primary: '#006400',      // Verde escuro (Dark Green)
  secondary: '#8B4513',    // Marrom escuro (mudança para maior contraste)
  accent: '#006400',       // Verde escuro (mesmo que primary)
  background: '#FFFFFF',   // Fundo branco
  surface: '#F8FAFC',      // Superfície cinza muito claro
  text: '#1A202C',         // Texto cinza escuro
  textSecondary: '#2D3748', // Texto secundário cinza médio
  border: '#E2E8F0'        // Borda cinza claro
};

// 4 Temas Predefinidos conforme especificação
export const PREDEFINED_THEMES: Record<string, ColorTheme> = {
  // 1. 🏆 Tema Lendário (Padrão) - Academia Lendária
  lendario: LEGENDARY_THEME,
  
  // 2. 💼 Tema Profissional - Azul e Marrom
  profissional: PROFESSIONAL_THEME,

  // 3. ✨ Tema Elegante - Verde Escuro e Azul Marinho
  elegante: ELEGANT_THEME,

  // 4. 🌿 Tema Natural - Verde Escuro e Marrom
  natural: NATURAL_THEME
};

// Default color theme (Lendário)
// Define minimum and maximum values for each agent type
export const AGENT_MIN_VALUES: Record<Service, number> = {
  'agente-sdr': 15000,
  'agente-closer': 15000,
};

export const AGENT_MAX_VALUES: Record<Service, number> = {
  'agente-sdr': 25000,
  'agente-closer': 25000,
};

export const AGENT_MIN_RECURRING: Record<Service, number> = {
  'agente-sdr': 2000,
  'agente-closer': 2000,
};

export const AGENT_MAX_RECURRING: Record<Service, number> = {
  'agente-sdr': 3500,
  'agente-closer': 3500,
};

export const DEFAULT_COLOR_THEME: ColorTheme = LEGENDARY_THEME;