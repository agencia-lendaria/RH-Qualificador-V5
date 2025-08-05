import { useState, useEffect } from 'react';
import type { ServiceConfig, PersonalData, IncludedItem, Service } from './types';
import { DEFAULT_COLOR_THEME, DEFAULT_INCLUDED_ITEMS, SERVICE_TYPES, AGENT_MAX_VALUES, AGENT_MAX_RECURRING } from './types';
import StepOne from './steps/StepOne';
import StepThree from './steps/StepThree';
import StepFive from './steps/StepFive';
import StepSix from './steps/StepSix';
import StepSeven from './steps/StepSeven';
import SuccessScreen from './steps/SuccessScreen';
import SummaryPanel from './components/SummaryPanel';
import { ClipboardList, X } from 'lucide-react';
import { ensureSafeValue, shouldDisplayValue } from './utils/format';

// Initial state for service configuration with new pricing
const INITIAL_SERVICE_CONFIG: ServiceConfig = {
  serviceType: 'agente-sdr',
  serviceTypeName: SERVICE_TYPES['agente-sdr'],
  baseValue: 15000, // Minimum base value
  quantity: 1,
  recurring: false,
  recurringValue: undefined,
  paymentMethod: 'credit-card',
  installments: 1,
  contractDuration: '12',
  contractDiscount: undefined,
  cashDiscount: undefined,
  customInterest: undefined,
  colorTheme: DEFAULT_COLOR_THEME
};

// Initial state for personal data
const INITIAL_PERSONAL_DATA: PersonalData = {
  name: '',
  whatsapp: '',
  email: '',
  budget: undefined,
  agencyName: '',
  logoFile: undefined,
  logoDataUrl: undefined
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig>(INITIAL_SERVICE_CONFIG);
  const [includedItems, setIncludedItems] = useState<IncludedItem[]>(DEFAULT_INCLUDED_ITEMS);
  const [personalData, setPersonalData] = useState<PersonalData>(INITIAL_PERSONAL_DATA);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to update includedItems based on serviceType
  useEffect(() => {
    if (serviceConfig.serviceType === 'agente-closer') {
      // For agente-closer: remove meeting feature and adjust other recurring prices to compensate
      const closerItems = DEFAULT_INCLUDED_ITEMS.map(item => {
        if (item.id === '7') {
          // Remove meeting feature
          return null;
        } else if (item.id === '5') {
          // Increase Dashboard de Métricas from 500 to 700 (+200)
          return { ...item, price: 700 };
        } else if (item.id === '6') {
          // Increase Relatórios Semanais from 400 to 600 (+200)
          return { ...item, price: 600 };
        } else if (item.id === '8') {
          // Increase Grupo de Suporte dedicado from 500 to 600 (+100)
          return { ...item, price: 600 };
        } else if (item.id === '10') {
          // Increase Acesso às Novas Atualizações from 700 to 800 (+100)
          return { ...item, price: 800 };
        }
        return item;
      }).filter(Boolean) as IncludedItem[];
      
      // Ensure required items are always included
      const requiredItems = closerItems.filter(item => item.required);
      const nonRequiredItems = closerItems.filter(item => !item.required);
      
      // Start with required items and add any non-required items that were previously selected
      const currentNonRequiredItems = includedItems.filter(item => !item.required);
      const finalItems = [...requiredItems, ...currentNonRequiredItems];
      
      setIncludedItems(finalItems);
    } else {
      // For agente-sdr: use original prices but ensure required items are included
      const requiredItems = DEFAULT_INCLUDED_ITEMS.filter(item => item.required);
      const nonRequiredItems = DEFAULT_INCLUDED_ITEMS.filter(item => !item.required);
      
      // Start with required items and add any non-required items that were previously selected
      const currentNonRequiredItems = includedItems.filter(item => !item.required);
      const finalItems = [...requiredItems, ...currentNonRequiredItems];
      
      setIncludedItems(finalItems);
    }
  }, [serviceConfig.serviceType, includedItems]);

  const pricing = {
    baseTotal: calculateBaseTotal(),
    recurringTotal: calculateRecurringTotal(),
    itemsTotal: calculateItemsTotal(),
    discountAmount: calculateDiscount(),
    finalInstallmentValue: calculateInstallmentValue(),
    projectTotal: calculateProjectTotal(),
    totalValue: calculateTotalValue()
  };

  function calculateBaseTotal() {
    if (!shouldDisplayValue(serviceConfig.baseValue)) return 0;
    
    const baseValue = ensureSafeValue(serviceConfig.baseValue, 0);
    const quantity = Math.max(1, serviceConfig.quantity || 1);
    return baseValue * quantity;
  }

  function calculateItemsTotal() {
    return includedItems
      .filter(item => !item.isRecurring && shouldDisplayValue(item.price))
      .reduce((sum, item) => sum + (item.price || 0), 0);
  }

  function calculateRecurringTotal() {
    let total = 0;

    // Calculate recurring value from required items (minimum 2k)
    const requiredRecurringItems = includedItems
      .filter(item => item.isRecurring && item.required && shouldDisplayValue(item.price))
      .reduce((sum, item) => sum + (item.price || 0), 0);

    // Calculate additional recurring value from optional items
    const optionalRecurringItems = includedItems
      .filter(item => item.isRecurring && !item.required && shouldDisplayValue(item.price))
      .reduce((sum, item) => sum + (item.price || 0), 0);

    // Total recurring value: required items (minimum 2k) + optional items
    const totalRecurringValue = requiredRecurringItems + optionalRecurringItems;
    
    if (serviceConfig.recurring) {
      const quantity = Math.max(1, serviceConfig.quantity || 1);
      total += totalRecurringValue * quantity;
    }

    return total;
  }



  function calculateDiscount() {
    const baseTotal = calculateBaseTotal();
    if (!shouldDisplayValue(baseTotal)) return 0;

    let totalDiscount = 0;

    // Payment method discount
    if (serviceConfig.cashDiscount && 
        ['pix', 'bank-transfer'].includes(serviceConfig.paymentMethod) && 
        serviceConfig.cashDiscount > 0) {
      totalDiscount += baseTotal * serviceConfig.cashDiscount;
    }

    // Contract duration discount
    if (serviceConfig.contractDiscount && serviceConfig.contractDiscount > 0) {
      totalDiscount += baseTotal * serviceConfig.contractDiscount;
    }

    return Math.max(0, totalDiscount);
  }

  function calculateInstallmentValue() {
    if (serviceConfig.paymentMethod !== 'credit-card' || 
        !serviceConfig.installments ||
        serviceConfig.installments <= 1) {
      return 0;
    }

    const projectTotal = calculateProjectTotal();
    if (!shouldDisplayValue(projectTotal)) return 0;

    const installments = Math.max(1, serviceConfig.installments);
    const interest = 0.02 * (installments - 1);
    const totalWithInterest = projectTotal * (1 + interest);
    
    return Math.max(1, totalWithInterest / installments);
  }

  function calculateProjectTotal() {
    let total = calculateBaseTotal();
    
    if (!shouldDisplayValue(total)) return 0;
    
    // Add only one-time items to setup price
    total += calculateItemsTotal();

    // Apply interest or discount
    if (serviceConfig.paymentMethod === 'credit-card' && 
        serviceConfig.installments && 
        serviceConfig.installments > 1) {
      const interest = 0.02 * (serviceConfig.installments - 1);
      total = total * (1 + interest);
    } else {
      // Apply discounts
      total -= calculateDiscount();
    }

    return Math.max(0, total);
  }

  function calculateTotalValue() {
    return calculateProjectTotal() + calculateRecurringTotal();
  }

  const handleGoBack = (step: number) => {
    // Clear data for current and future steps when going back
    setIsLoading(true);
    
    // Use setTimeout to prevent flickering
    setTimeout(() => {
      handleGoBackImmediate(step);
      setIsLoading(false);
    }, 50);
  };

  const handleGoBackImmediate = (step: number) => {
    switch (step) {
      case 1:
        setServiceConfig(INITIAL_SERVICE_CONFIG);
        setIncludedItems(DEFAULT_INCLUDED_ITEMS);
        setPersonalData(INITIAL_PERSONAL_DATA);
        break;
      case 2:
        setIncludedItems(DEFAULT_INCLUDED_ITEMS);
        setPersonalData(INITIAL_PERSONAL_DATA);
        break;
      case 3:
        setServiceConfig(prev => ({
          ...prev,
          paymentMethod: '' as any,
          installments: undefined,
          cashDiscount: undefined
        }));
        setPersonalData(INITIAL_PERSONAL_DATA);
        break;
      case 4:
        setServiceConfig(prev => ({
          ...prev,
          colorTheme: DEFAULT_COLOR_THEME
        }));
        setPersonalData(INITIAL_PERSONAL_DATA);
        break;
    }
    setCurrentStep(step);
  };

  const handleFinalSubmit = async (finalPersonalData: PersonalData) => {
    setIsLoading(true);
    const timestamp = new Date().toISOString();
    setSubmissionTimestamp(timestamp);
    setPersonalData(finalPersonalData);
    setIsLoading(false);
    setIsSuccess(true);
  };

  // Prevent rendering during loading to avoid flickering
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <SuccessScreen 
        email={personalData.email}
        personalData={personalData}
        serviceConfig={serviceConfig}
        includedItems={includedItems}
        pricing={pricing}
        timestamp={submissionTimestamp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col">
      <div className="main-content">
        <div className="content-wrapper">
          <div className="container mx-auto px-4 py-4 lg:py-6">
            <header className="flex items-center justify-between gap-3 mb-6 lg:mb-8">
              <h1 className="text-2xl font-bold text-white">
                Calculador<span className="text-[#CABD95]">[IA]</span>
              </h1>
              {currentStep > 1 && (
                <button
                  onClick={() => setShowMobileSummary(true)}
                  className="lg:hidden bg-[#CABD95] text-[#161616] px-4 py-3 rounded-full font-medium shadow-lg flex items-center gap-2 min-h-[44px] text-sm"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="hidden xs:inline">Ver Resumo</span>
                  <span className="xs:hidden">Resumo</span>
                </button>
              )}
            </header>

            <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 max-w-6xl mx-auto">
              <div className="relative">
                {currentStep === 1 && (
                  <StepOne
                    serviceConfig={serviceConfig}
                    onNext={(config) => {
                      setServiceConfig(config);
                      setCurrentStep(2);
                    }}
                  />
                )}

                {currentStep === 2 && (
                  <StepThree
                    includedItems={includedItems}
                    serviceConfig={serviceConfig}
                    onBack={() => handleGoBack(1)}
                    onNext={(items) => {
                      setIsLoading(true);
                      setIncludedItems(items);
                      setTimeout(() => {
                        setCurrentStep(3);
                        setIsLoading(false);
                      }, 50);
                    }}
                    onUpdateItems={setIncludedItems}
                  />
                )}

                {currentStep === 3 && (
                  <StepFive
                    serviceConfig={serviceConfig}
                    onBack={() => handleGoBack(2)}
                    onNext={(config) => {
                      setIsLoading(true);
                      setServiceConfig(config);
                      setTimeout(() => {
                        setCurrentStep(4);
                        setIsLoading(false);
                      }, 50);
                    }}
                    onUpdateConfig={updates => setServiceConfig(prev => ({ ...prev, ...updates }))}
                  />
                )}

                {currentStep === 4 && (
                  <StepSix
                    serviceConfig={serviceConfig}
                    onBack={() => handleGoBack(3)}
                    onNext={(config) => {
                      setIsLoading(true);
                      setServiceConfig(config);
                      setTimeout(() => {
                        setCurrentStep(5);
                        setIsLoading(false);
                      }, 50);
                    }}
                    onUpdateConfig={updates => setServiceConfig(prev => ({ ...prev, ...updates }))}
                  />
                )}

                {currentStep === 5 && (
                  <StepSeven
                    personalData={personalData}
                    onBack={() => handleGoBack(4)}
                    onSubmit={handleFinalSubmit}
                    serviceConfig={serviceConfig}
                    includedItems={includedItems}
                    pricing={pricing}
                  />
                )}
              </div>

              <div className="hidden lg:block">
                <SummaryPanel
                  serviceConfig={serviceConfig}
                  includedItems={includedItems}
                  currentStep={currentStep}
                  onGenerateQuote={() => {}}
                  isConfigFinalized={false}
                />
              </div>

              <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
                  showMobileSummary ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setShowMobileSummary(false)}
              >
                <div
                  className={`fixed bottom-0 left-0 right-0 bg-[#1A1A1C] rounded-t-xl transition-transform duration-300 transform safe-area-inset-bottom ${
                    showMobileSummary ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="relative">
                    {/* Handle bar for better UX */}
                    <div className="w-12 h-1 bg-[#444] rounded-full mx-auto mt-3 mb-2"></div>
                    <button
                      onClick={() => setShowMobileSummary(false)}
                      className="absolute right-4 top-6 text-[#A0A0A0] hover:text-white transition-colors p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="p-4 max-h-[75vh] overflow-y-auto pt-12 pb-8">
                      <SummaryPanel
                        serviceConfig={serviceConfig}
                        includedItems={includedItems}
                        currentStep={currentStep}
                        onGenerateQuote={() => {}}
                        isConfigFinalized={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}