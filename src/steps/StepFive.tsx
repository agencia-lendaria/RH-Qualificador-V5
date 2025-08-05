import { useState } from 'react';
import type { ServiceConfig, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../types';
import StepIndicator from '../components/StepIndicator';
import NavigationButtons from '../components/NavigationButtons';

interface Props {
  serviceConfig: ServiceConfig;
  onBack: () => void;
  onNext: (config: ServiceConfig) => void;
  onUpdateConfig: (updates: Partial<ServiceConfig>) => void;
}

export default function StepFive({ serviceConfig, onBack, onNext, onUpdateConfig }: Props) {
  const [localConfig, setLocalConfig] = useState(serviceConfig);
  const [showDiscount, setShowDiscount] = useState(false);
  const [cashDiscountInput, setCashDiscountInput] = useState(
    serviceConfig.cashDiscount ? String(serviceConfig.cashDiscount * 100) : ''
  );

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setLocalConfig(prev => ({
      ...prev,
      paymentMethod: method,
      installments: method === 'credit-card' ? 1 : undefined,
      cashDiscount: ['pix', 'bank-transfer'].includes(method) && showDiscount ? (Number(cashDiscountInput) / 100) : undefined
    }));
    onUpdateConfig({
      paymentMethod: method,
      installments: method === 'credit-card' ? 1 : undefined,
      cashDiscount: ['pix', 'bank-transfer'].includes(method) && showDiscount ? (Number(cashDiscountInput) / 100) : undefined
    });
  };

  const handleInstallmentChange = (value: number) => {
    const safeValue = Math.max(1, value);
    const updates = { installments: safeValue };
    setLocalConfig(prev => ({ ...prev, ...updates }));
    onUpdateConfig(updates);
  };

  const handleDiscountToggle = () => {
    setShowDiscount(!showDiscount);
    if (!showDiscount) {
      setCashDiscountInput('');
      const updates = { cashDiscount: 0 };
      setLocalConfig(prev => ({ ...prev, ...updates }));
      onUpdateConfig(updates);
    } else {
      const updates = { cashDiscount: undefined };
      setLocalConfig(prev => ({ ...prev, ...updates }));
      onUpdateConfig(updates);
    }
  };

  const handleCashDiscountChange = (value: string) => {
    // Allow empty input
    if (value === '') {
      setCashDiscountInput('');
      const updates = { cashDiscount: 0 };
      setLocalConfig(prev => ({ ...prev, ...updates }));
      onUpdateConfig(updates);
      return;
    }

    // Remove any non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Convert to number and ensure it's between 0 and 100
    const percentage = Math.min(100, Math.max(0, Number(numericValue)));
    
    setCashDiscountInput(String(percentage));
    const updates = { cashDiscount: percentage / 100 };
    setLocalConfig(prev => ({ ...prev, ...updates }));
    onUpdateConfig(updates);
  };

  const isConfigValid = localConfig.paymentMethod && (
    localConfig.paymentMethod === 'credit-card' ? localConfig.installments && localConfig.installments > 0 :
    true
  );

  const handleFinish = () => {
    if (isConfigValid) {
      onNext(localConfig);
    }
  };

  return (
    <div>
      <StepIndicator
        stepName="Pagamento"
        title="Forma de Pagamento"
        subtitle="Escolha como o projeto será cobrado"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {(Object.entries(PAYMENT_METHODS) as [PaymentMethod, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handlePaymentMethodChange(value)}
              className={`p-4 rounded-lg border transition-all active:scale-95 min-h-[48px] text-left ${
                localConfig.paymentMethod === value
                  ? 'border-[#CABD95] text-[#CABD95]'
                  : 'border-[#2A2A2D] hover:border-[#CABD95]'
              }`}
            >
              <span className="block text-base font-medium">{label}</span>
            </button>
          ))}
        </div>

        {localConfig.paymentMethod === 'credit-card' && (
          <div className="animate-fadeIn space-y-4">
            <label className="block text-sm text-[#B8B8B8] mb-3">
              Número de Parcelas
            </label>
            <div className="bg-[#1D1D22] rounded-lg p-4 border border-[#2A2A2D]">
              <input
                type="range"
                min="1"
                max="12"
                value={localConfig.installments || 1}
                onChange={(e) => handleInstallmentChange(Number(e.target.value))}
                className="w-full h-3 md:h-2 bg-[#2A2A2D] rounded-lg appearance-none cursor-pointer mb-4"
              />
              <div className="flex justify-between text-xs md:text-sm text-[#A0A0A0] mb-3">
                <span>1x (sem juros)</span>
                <span>12x (2% a.m.)</span>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-xl font-medium text-white">
                  {localConfig.installments || 1}x
                  {(localConfig.installments || 1) > 1 ? ' com juros de 2% ao mês' : ' sem juros'}
                </p>
              </div>
            </div>
          </div>
        )}

        {['pix', 'bank-transfer'].includes(localConfig.paymentMethod) && (
          <div className="animate-fadeIn">
            {/* Toggle melhorado para mobile */}
            <div className="bg-[#1D1D22] rounded-lg p-4 border border-[#2A2A2D]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-base font-medium text-white block">Aplicar Desconto</span>
                  <span className="text-sm text-[#A0A0A0]">Desconto para pagamento à vista</span>
                </div>
                <button
                  onClick={handleDiscountToggle}
                  className={`relative inline-flex h-8 w-14 md:h-6 md:w-11 items-center rounded-full transition-all duration-300 active:scale-95 ${
                    showDiscount ? 'bg-[#CABD95]' : 'bg-[#2A2A2D]'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 md:h-4 md:w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                      showDiscount ? 'translate-x-8 md:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {showDiscount && (
              <div className="animate-fadeIn mt-4">
                <label className="block text-sm text-[#B8B8B8] mb-2">
                  Desconto para Pagamento à Vista (%)
                </label>
                <input
                  type="text"
                  value={cashDiscountInput}
                  onChange={(e) => handleCashDiscountChange(e.target.value)}
                  className="input"
                  placeholder="Digite o percentual de desconto"
                  inputMode="numeric"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        isNextDisabled={!isConfigValid}
        isLastStep={true}
        onFinish={handleFinish}
      />
    </div>
  );
}