import { useState } from 'react';
import type { Service, ServiceConfig } from '../types';
import { SERVICE_TYPES, SERVICE_DESCRIPTIONS, AGENT_MIN_VALUES, AGENT_MAX_VALUES, AGENT_MIN_RECURRING, AGENT_MAX_RECURRING } from '../types';
import StepIndicator from '../components/StepIndicator';
import NavigationButtons from '../components/NavigationButtons';
import { Bot, Target } from 'lucide-react';

// Icons for each service type
const SERVICE_ICONS: Record<Service, React.ComponentType<any>> = {
  'agente-sdr': Target,
  'agente-closer': Bot,
};

interface Props {
  serviceConfig: ServiceConfig;
  onNext: (config: ServiceConfig) => void;
}

export default function StepOne({ serviceConfig, onNext }: Props) {
  const [selectedService, setSelectedService] = useState<Service | null>(serviceConfig.serviceType || null);

  const handleServiceSelect = (type: Service) => {
    setSelectedService(type);
  };

  const isNextDisabled = () => {
    return !selectedService;
  };

  const handleNext = () => {
    if (selectedService && !isNextDisabled()) {
      onNext({
        serviceType: selectedService,
        serviceTypeName: SERVICE_TYPES[selectedService],
        customServiceName: undefined,
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
  
        colorTheme: serviceConfig.colorTheme
      });
    }
  };

  return (
    <div>
      <StepIndicator
        stepName="Projeto"
        title="Que tipo de Projeto você irá desenvolver?"
        subtitle="Selecione o tipo de projeto que será criado para seu cliente"
      />

      <div className="space-y-6">
        {/* Service Selector */}
        <div>
          <label className="block text-sm text-[#B8B8B8] mb-3">
            Tipo de Serviço de IA
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(SERVICE_TYPES) as Service[]).map((type) => {
              const Icon = SERVICE_ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => handleServiceSelect(type)}
                  className={`
                    flex flex-col items-center justify-center p-6 rounded-lg border-2
                    ${selectedService === type ? 'border-[#CABD95] bg-[#CABD95]/10' : 'border-[#333] hover:border-[#555]'}
                    transition-all duration-200 text-white text-center
                  `}
                >
                  {Icon && <Icon className="w-8 h-8 mb-3 text-[#CABD95]" />}
                  <span className="font-medium text-lg">{SERVICE_TYPES[type]}</span>
                  <span className="text-sm text-[#A0A0A0] mt-1">
                    Setup: R$ 15k-25k | Rec: R$ 2k-3.5k/mês
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service Description */}
        {selectedService && (
          <div className="bg-[#1D1D22] rounded-lg p-6 border border-[#CABD95]/20 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {(() => {
                  const IconComponent = SERVICE_ICONS[selectedService];
                  return <IconComponent className="w-8 h-8 text-[#CABD95]" />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#CABD95] mb-2">
                  {SERVICE_TYPES[selectedService]}
                </h3>
                <p className="text-[#B8B8B8] text-sm leading-relaxed mb-4">
                  {SERVICE_DESCRIPTIONS[selectedService]}
                </p>
                <div className="bg-[#242424] rounded-lg p-3">
                  <p className="text-xs text-[#A0A0A0] mb-1">Valor máximo:</p>
                  <p className="text-[#CABD95] font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(AGENT_MAX_VALUES[selectedService])}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavigationButtons
        onNext={handleNext}
        isNextDisabled={isNextDisabled()}
      />
    </div>
  );
}