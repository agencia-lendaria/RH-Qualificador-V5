import { useMemo } from 'react';
import type { ServiceConfig, IncludedItem } from '../types';
import { PAYMENT_METHODS, CONTRACT_DURATIONS, DEFAULT_INCLUDED_ITEMS } from '../types';
import { formatCurrency, ensureSafeValue, shouldDisplayValue, formatCurrencyIfValid } from '../utils/format';
import { Package, Puzzle, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  serviceConfig: ServiceConfig;
  includedItems: IncludedItem[];
  currentStep: number;
  onGenerateQuote: () => void;
  isConfigFinalized?: boolean;
}

export default function SummaryPanel({ 
  serviceConfig, 
  includedItems, 
  currentStep,
  onGenerateQuote,
  isConfigFinalized = false
}: Props) {
  // Memoize calculations to prevent unnecessary re-renders
  const { 
    baseTotal,
    recurringTotal,
    total,
    installmentValue,
    itemsTotal,
    monthlyItemsTotal,
    expressDeliveryFee,
    discountAmount,
    baseServiceValue,
    baseRecurringValue,
    contractDiscountAmount
  } = useMemo(() => {
    // Early return if serviceConfig is not properly initialized
    if (!serviceConfig.serviceType || !serviceConfig.baseValue) {
      return {
        baseTotal: 0,
        recurringTotal: 0,
        total: 0,
        installmentValue: 0,
        itemsTotal: 0,
        monthlyItemsTotal: 0,
        expressDeliveryFee: 0,
        discountAmount: 0,
        baseServiceValue: 0,
        baseRecurringValue: 0,
        contractDiscountAmount: 0
      };
    }

    // Calculate one-time items total
    const oneTimeItems = includedItems
      .filter(item => !item.isRecurring && item.price && item.price > 0)
      .reduce((sum, item) => sum + (item.price || 0), 0);

    // Calculate monthly items total
    const monthlyItems = includedItems
      .filter(item => item.isRecurring && item.price && item.price > 0)
      .reduce((sum, item) => sum + (item.price || 0), 0);

    // Base service values - ensure safe values
    const baseValue = ensureSafeValue(serviceConfig.baseValue, 0);
    const quantity = Math.max(1, serviceConfig.quantity || 1);
    const baseServiceValue = baseValue * quantity;
    
    const baseRecurringValue = serviceConfig.recurring && 
      serviceConfig.recurringValue && 
      serviceConfig.recurringValue > 0 ? 
      ensureSafeValue(serviceConfig.recurringValue, 0) * quantity : 0;

    let baseTotal = baseServiceValue + oneTimeItems;

    // Calculate cash discount if applicable
    const cashDiscountAmount = serviceConfig.cashDiscount && 
      ['pix', 'bank-transfer'].includes(serviceConfig.paymentMethod) && 
      baseTotal > 0
      ? baseTotal * serviceConfig.cashDiscount
      : 0;

    // Apply cash discount or interest
    if (serviceConfig.paymentMethod === 'credit-card' && 
        serviceConfig.installments && 
        serviceConfig.installments > 1) {
      const interest = 0.02 * (serviceConfig.installments - 1);
      baseTotal = baseTotal * (1 + interest);
    } else if (cashDiscountAmount > 0) {
      baseTotal = Math.max(0, baseTotal - cashDiscountAmount);
    }

    // Calculate contract discount on total value
    const contractDiscountAmount = serviceConfig.contractDiscount && baseTotal > 0 ? 
      baseTotal * serviceConfig.contractDiscount : 0;

    // Apply contract discount
    if (contractDiscountAmount > 0) {
      baseTotal = Math.max(0, baseTotal - contractDiscountAmount);
    }

    // Calculate monthly total (recurring service + monthly items)
    const monthlyTotal = baseRecurringValue + monthlyItems;

    // Calculate installment value
    const installmentValue = serviceConfig.paymentMethod === 'credit-card' && 
      serviceConfig.installments && 
      serviceConfig.installments > 1 && 
      baseTotal > 0
      ? Math.max(1, baseTotal / serviceConfig.installments)
      : 0;

    return {
      baseTotal: Math.max(0, baseTotal),
      recurringTotal: Math.max(0, monthlyTotal),
      total: Math.max(0, baseTotal),
      installmentValue,
      itemsTotal: Math.max(0, oneTimeItems),
      monthlyItemsTotal: Math.max(0, monthlyItems),
      discountAmount: Math.max(0, cashDiscountAmount),
      contractDiscountAmount: Math.max(0, contractDiscountAmount),
      baseServiceValue: Math.max(0, baseServiceValue),
      baseRecurringValue: Math.max(0, baseRecurringValue)
    };
  }, [serviceConfig, includedItems]);



  const renderStepSummary = () => {
    if (currentStep === 1) {
      return (
        <div className="animate-fadeIn space-y-8">
          <h3 className="text-xl font-semibold text-[#CABD95] mb-6">O que você pode fazer com a Calculador[IA]</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#242424] rounded-lg">
                <Package className="w-6 h-6 text-[#CABD95]" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Dimensione seus Serviços de IA</h4>
                <p className="text-sm text-[#B8B8B8]">Calcule valores e estruture pacotes personalizados de serviços de Inteligência Artificial</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#242424] rounded-lg">
                <Puzzle className="w-6 h-6 text-[#CABD95]" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Ofereça Soluções Completas</h4>
                <p className="text-sm text-[#B8B8B8]">Monte propostas com recursos e integrações que atendam às necessidades específicas dos seus clientes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#242424] rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#CABD95]" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Maximize seus Resultados</h4>
                <p className="text-sm text-[#B8B8B8]">Estruture modelos de negócio escaláveis com serviços recorrentes e pacotes personalizados</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#242424] rounded-lg">
                <Sparkles className="w-6 h-6 text-[#CABD95]" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Automatize seu Negócio</h4>
                <p className="text-sm text-[#B8B8B8]">Crie propostas profissionais de forma rápida e padronizada para seus serviços de IA</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 2:
        const selectedItems = includedItems.filter(item => item.price && item.price > 0);
        const zeroPriceItems = includedItems.filter(item => !item.custom && item.price === 0);
        const removedItems = DEFAULT_INCLUDED_ITEMS.filter(defaultItem => 
          !includedItems.some(item => item.id === defaultItem.id)
        );
        
        return (
          <div className="animate-fadeIn space-y-4">
            {selectedItems.length > 0 && (
              <div>
                <span className="text-sm text-[#A0A0A0] block mb-2">Recursos Inclusos ({selectedItems.length})</span>
                <ul className="space-y-1">
                  {selectedItems.map((item) => (
                    <li key={item.id} className="text-sm text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CABD95]" />
                        {item.label}
                      </div>
                      <span className="text-[#CABD95]">
                        {formatCurrency(item.price!)}
                        {item.isRecurring ? '/mês' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {zeroPriceItems.length > 0 && (
              <div>
                <span className="text-sm text-[#A0A0A0] block mb-2">Recursos Gratuitos ({zeroPriceItems.length})</span>
                <ul className="space-y-1">
                  {zeroPriceItems.map((item) => (
                    <li key={item.id} className="text-sm text-orange-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {item.label}
                      </div>
                      <span className="text-orange-400">
                        Grátis
                        {item.isRecurring ? '/mês' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {removedItems.length > 0 && (
              <div>
                <span className="text-sm text-[#A0A0A0] block mb-2">Recursos Removidos ({removedItems.length})</span>
                <ul className="space-y-1">
                  {removedItems.map((item) => (
                    <li key={item.id} className="text-sm text-[#A0A0A0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A0A0A0]" />
                        {item.label}
                      </div>
                      <span className="text-[#A0A0A0] line-through">
                        {formatCurrency(item.price!)}
                        {item.isRecurring ? '/mês' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      case 3:
        return serviceConfig.paymentMethod && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <span className="text-sm text-[#A0A0A0] block">Forma de Pagamento</span>
              <p className="text-white">{PAYMENT_METHODS[serviceConfig.paymentMethod]}</p>
            </div>
            {serviceConfig.paymentMethod === 'credit-card' && 
             serviceConfig.installments && 
             serviceConfig.installments > 0 && (
              <div>
                <span className="text-sm text-[#A0A0A0] block">Parcelamento</span>
                <p className="text-white">
                  {serviceConfig.installments}x{shouldDisplayValue(installmentValue) ? ` de ${formatCurrency(installmentValue)}` : ''}
                  {serviceConfig.installments > 1 ? ' (2% a.m.)' : ' (sem juros)'}
                </p>
              </div>
            )}
            {shouldDisplayValue(discountAmount) && (
              <div>
                <span className="text-sm text-[#A0A0A0] block">Desconto à Vista</span>
                <p className="text-white">{(serviceConfig.cashDiscount! * 100).toFixed(0)}% ({formatCurrency(discountAmount)})</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1A1A1C] rounded-xl p-4 md:p-8 lg:sticky lg:top-8">
      {currentStep === 1 ? (
        renderStepSummary()
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-8 text-[#CABD95]">Resumo do Orçamento</h3>

          <div className="space-y-6">
            {serviceConfig.serviceType && (
              <div className="pb-6 border-b border-[#2A2A2D]">
                <span className="text-sm text-[#A0A0A0] block mb-2">Serviço</span>
                <p className="text-lg font-medium text-white">{serviceConfig.serviceTypeName}</p>
              </div>
            )}

            {shouldDisplayValue(total) && (
              <div className="pb-6 border-b border-[#2A2A2D] space-y-4">
                <div>
                  <span className="text-sm text-[#A0A0A0] block mb-1">Valor Total do Projeto</span>
                  <p className="text-2xl md:text-3xl font-bold text-[#CABD95]">{formatCurrency(total)}</p>
                  <div className="mt-2 space-y-1">
                    {shouldDisplayValue(baseServiceValue) && (
                      <p className="text-sm text-[#A0A0A0] flex justify-between">
                        <span>
                          {`Valor Base (${serviceConfig.quantity}x)`}
                        </span>
                        <span>{formatCurrency(baseServiceValue)}</span>
                      </p>
                    )}
                    {shouldDisplayValue(itemsTotal) && (
                      <p className="text-sm text-[#A0A0A0] flex justify-between">
                        <span>Recursos Adicionais</span>
                        <span>+{formatCurrency(itemsTotal)}</span>
                      </p>
                    )}

                    {shouldDisplayValue(discountAmount) && (
                      <p className="text-sm text-[#CABD95] flex justify-between">
                        <span>Desconto à Vista ({(serviceConfig.cashDiscount! * 100).toFixed(0)}%)</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </p>
                    )}
                    {shouldDisplayValue(contractDiscountAmount) && (
                      <p className="text-sm text-[#CABD95] flex justify-between">
                        <span>Desconto Contrato ({(serviceConfig.contractDiscount! * 100).toFixed(0)}%)</span>
                        <span>-{formatCurrency(contractDiscountAmount)}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {shouldDisplayValue(recurringTotal) && (
                  <div>
                    <span className="text-sm text-[#A0A0A0] block mb-1">Valor Mensal</span>
                    <p className="text-xl md:text-2xl font-semibold text-[#CABD95]">
                      {formatCurrency(recurringTotal)}
                    </p>
                    {(shouldDisplayValue(baseRecurringValue) || shouldDisplayValue(monthlyItemsTotal)) && (
                      <div className="mt-2 space-y-1">
                        {shouldDisplayValue(baseRecurringValue) && (
                          <p className="text-sm text-[#A0A0A0] flex justify-between">
                            <span>
                              {`Manutenção (${serviceConfig.quantity}x)`}
                            </span>
                            <span>{formatCurrency(baseRecurringValue)}</span>
                          </p>
                        )}
                        {shouldDisplayValue(monthlyItemsTotal) && (
                          <p className="text-sm text-[#A0A0A0] flex justify-between">
                            <span>Recursos Mensais</span>
                            <span>+{formatCurrency(monthlyItemsTotal)}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {serviceConfig.contractDuration && (
                  <div>
                    <span className="text-sm text-[#A0A0A0] block mb-1">Tempo de Contrato</span>
                    <p className="text-lg font-medium text-white">
                      {CONTRACT_DURATIONS[serviceConfig.contractDuration]}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-[#A0A0A0]">Proposta válida por 7 dias</p>
              </div>
            )}

            <div className="space-y-4">
              {renderStepSummary()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}