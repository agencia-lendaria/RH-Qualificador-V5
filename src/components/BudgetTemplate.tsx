import { ServiceConfig, IncludedItem, PersonalData } from '../types';
import { formatCurrency, ensureSafeValue, shouldDisplayValue } from '../utils/format';
import { DEFAULT_COLOR_THEME } from '../types';

interface BudgetTemplateProps {
  personalData: PersonalData;
  serviceConfig: ServiceConfig;
  includedItems: IncludedItem[];
  pricing: {
    baseTotal: number;
    recurringTotal: number;
    totalValue: number;
    expressDeliveryFee?: number;
    itemsTotal: number;
    discountAmount?: number;
    interestAmount?: number;
    finalInstallmentValue?: number;
    projectTotal: number;
  };
  timestamp: string;
}

export default function BudgetTemplate({
  personalData,
  serviceConfig,
  includedItems,
  pricing,
  timestamp
}: BudgetTemplateProps) {
  const theme = serviceConfig.colorTheme || DEFAULT_COLOR_THEME;

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const validUntil = new Date(timestamp);
  validUntil.setDate(validUntil.getDate() + 7);



  // Filter and sort items, excluding items with zero or undefined prices
  const sortedItems = [...includedItems]
    .filter(item => !item.price || item.price > 0) // Keep items with no price (bonus) or price > 0
    .sort((a, b) => {
      // Sort by price (paid items first)
      if ((a.price || 0) > 0 && !(b.price || 0)) return -1;
      if (!(a.price || 0) && (b.price || 0) > 0) return 1;
      // Then by recurring status
      if (a.isRecurring && !b.isRecurring) return 1;
      if (!a.isRecurring && b.isRecurring) return -1;
      return 0;
    });

  // Split items into columns if more than 3
  const shouldUseColumns = sortedItems.length > 3;
  const midPoint = Math.ceil(sortedItems.length / 2);
  const leftColumnItems = shouldUseColumns ? sortedItems.slice(0, midPoint) : sortedItems;
  const rightColumnItems = shouldUseColumns ? sortedItems.slice(midPoint) : [];

  // Ensure safe values for display
  const safeBaseValue = ensureSafeValue(serviceConfig.baseValue, 1);
  const safeBaseTotal = ensureSafeValue(pricing.baseTotal, safeBaseValue * serviceConfig.quantity);
  const safeProjectTotal = ensureSafeValue(pricing.projectTotal, safeBaseTotal);
  const safeRecurringTotal = Math.max(0, pricing.recurringTotal || 0);
  const safeRecurringValue = serviceConfig.recurringValue && serviceConfig.recurringValue > 0 
    ? ensureSafeValue(serviceConfig.recurringValue, 0) 
    : 0;

  return (
    <div 
      className="w-full min-h-full text-white p-4 md:p-8 lg:p-12"
      style={{ 
        backgroundColor: theme.background,
        color: theme.text
      }}
    >
      <div className="mb-8 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Orçamento <span style={{ color: theme.primary }}>{personalData.agencyName || 'Sua Agência'}</span>
            </h1>
            <p 
              className="text-sm md:text-base"
              style={{ color: theme.textSecondary }}
            >
              Emitido em: {formatDate(timestamp)} | Válido até: {formatDate(validUntil.toISOString())}
            </p>
          </div>
          
          {/* Logo */}
          {personalData.logoDataUrl && (
            <div className="flex-shrink-0 ml-3 sm:ml-6">
              <img
                src={personalData.logoDataUrl}
                alt={`Logo ${personalData.agencyName || 'da agência'}`}
                className="max-w-[80px] max-h-[60px] sm:max-w-[120px] sm:max-h-[80px] w-auto h-auto object-contain"
                style={{
                  filter: theme.background === '#FFFFFF' ? 'none' : 'brightness(1.1) contrast(1.1)'
                }}
              />
            </div>
          )}
        </div>
        
        <div 
          className="h-[2px] mt-4"
          style={{ backgroundColor: theme.border }}
        ></div>
      </div>

      <div className="mb-8">
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: theme.primary }}
        >
          Detalhes do Serviço
        </h2>
        <div 
          className="rounded-lg p-4 md:p-6"
          style={{ backgroundColor: theme.surface }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: theme.textSecondary }}
              >
                Tipo de Serviço
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {serviceConfig.serviceTypeName}
              </p>
            </div>
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: theme.textSecondary }}
              >
                Quantidade
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {serviceConfig.quantity} unidade(s)
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: theme.textSecondary }}
              >
                Valor Base (por unidade)
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {formatCurrency(safeBaseValue)}
              </p>
            </div>
            {serviceConfig.recurring && shouldDisplayValue(safeRecurringValue) && (
              <div>
                              <p 
                className="text-sm mb-1"
                style={{ color: theme.textSecondary }}
              >
                Manutenção (por unidade)
              </p>
                <p className="text-base" style={{ color: theme.text }}>
                  {formatCurrency(safeRecurringValue)}
                </p>
              </div>
            )}
            <div>
              <p 
                className="text-sm mb-1"
                style={{ color: theme.textSecondary }}
              >
                Forma de Pagamento
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {serviceConfig.paymentMethod === 'credit-card' && `Cartão de Crédito${serviceConfig.installments ? ` (${serviceConfig.installments}x)` : ''}`}
                {serviceConfig.paymentMethod === 'bank-transfer' && 'Transferência Bancária'}
                {serviceConfig.paymentMethod === 'pix' && 'PIX'}
                {serviceConfig.paymentMethod === 'bank-slip' && 'Boleto Bancário'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {sortedItems.length > 0 && (
        <div className="mb-8">
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Recursos
          </h2>
          <div className={`grid ${shouldUseColumns ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
            <div className="space-y-3">
              {leftColumnItems.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-lg p-3 flex items-center justify-between"
                  style={{ backgroundColor: theme.surface }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    ></div>
                    <span className="text-sm" style={{ color: theme.text }}>
                      {item.label}
                    </span>
                  </div>
                  <span 
                    className="text-sm"
                    style={{ color: theme.primary }}
                  >
                    {item.price && item.price > 0 
                      ? `${formatCurrency(item.price)}${item.isRecurring ? '/mês' : ''}`
                      : 'Bônus'
                    }
                  </span>
                </div>
              ))}
            </div>
            {shouldUseColumns && (
              <div className="space-y-3">
                {rightColumnItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="rounded-lg p-3 flex items-center justify-between"
                    style={{ backgroundColor: theme.surface }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <span className="text-sm" style={{ color: theme.text }}>
                        {item.label}
                      </span>
                    </div>
                    <span 
                      className="text-sm"
                      style={{ color: theme.primary }}
                    >
                      {item.price && item.price > 0 
                        ? `${formatCurrency(item.price)}${item.isRecurring ? '/mês' : ''}`
                        : 'Bônus'
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: theme.primary }}
        >
          Resumo de Valores
        </h2>
        <div 
          className="rounded-lg p-6"
          style={{ backgroundColor: theme.surface }}
        >
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Valor Total do Projeto</h3>
              <div className="space-y-2">
                {shouldDisplayValue(safeBaseTotal) && (
                  <p className="flex justify-between text-sm">
                    <span style={{ color: theme.textSecondary }}>
                      {`Valor Base (${serviceConfig.quantity}x)`}
                    </span>
                    <span style={{ color: theme.text }}>
                      {formatCurrency(safeBaseTotal)}
                    </span>
                  </p>
                )}
                {shouldDisplayValue(pricing.itemsTotal) && (
                  <p className="flex justify-between text-sm">
                    <span style={{ color: theme.textSecondary }}>
                      Recursos Adicionais
                    </span>
                    <span style={{ color: theme.text }}>
                      +{formatCurrency(pricing.itemsTotal)}
                    </span>
                  </p>
                )}
                {shouldDisplayValue(pricing.expressDeliveryFee) && (
                  <p className="flex justify-between text-sm">
                    <span style={{ color: theme.textSecondary }}>
                      Taxa Express
                    </span>
                    <span style={{ color: theme.text }}>
                      +{formatCurrency(pricing.expressDeliveryFee!)}
                    </span>
                  </p>
                )}
                {shouldDisplayValue(pricing.discountAmount) && (
                  <p className="flex justify-between text-sm">
                    <span style={{ color: theme.primary }}>
                      Desconto
                    </span>
                    <span style={{ color: theme.primary }}>
                      -{formatCurrency(pricing.discountAmount!)}
                    </span>
                  </p>
                )}
                <div 
                  className="h-[1px] my-2"
                  style={{ backgroundColor: theme.border }}
                ></div>
                <p className="flex justify-between text-base font-semibold">
                  <span>Total do Projeto</span>
                  <span style={{ color: theme.primary }}>
                    {formatCurrency(safeProjectTotal)}
                  </span>
                </p>
                {shouldDisplayValue(pricing.finalInstallmentValue) && (
                  <p 
                    className="text-sm text-right"
                    style={{ color: theme.textSecondary }}
                  >
                    {serviceConfig.installments}x de {formatCurrency(ensureSafeValue(pricing.finalInstallmentValue!, 1))}
                  </p>
                )}
              </div>
            </div>

            {shouldDisplayValue(safeRecurringTotal) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Valor Mensal</h3>
                <div className="space-y-2">
                  {serviceConfig.recurring && shouldDisplayValue(safeRecurringValue) && (
                    <p className="flex justify-between text-sm">
                      <span style={{ color: theme.textSecondary }}>
                        {`Manutenção (${serviceConfig.quantity}x)`}
                      </span>
                      <span style={{ color: theme.text }}>
                        {formatCurrency(safeRecurringValue * serviceConfig.quantity)}
                      </span>
                    </p>
                  )}
                  {sortedItems.filter(item => item.isRecurring && item.price && item.price > 0).length > 0 && (
                    <p className="flex justify-between text-sm">
                      <span style={{ color: theme.textSecondary }}>
                        Recursos Mensais
                      </span>
                      <span style={{ color: theme.text }}>
                        +{formatCurrency(sortedItems
                          .filter(item => item.isRecurring && item.price && item.price > 0)
                          .reduce((sum, item) => sum + (item.price || 0), 0)
                        )}
                      </span>
                    </p>
                  )}
                  <div 
                    className="h-[1px] my-2"
                    style={{ backgroundColor: theme.border }}
                  ></div>
                  <p className="flex justify-between text-base font-semibold">
                    <span>Total Mensal</span>
                    <span style={{ color: theme.primary }}>
                      {formatCurrency(safeRecurringTotal)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: theme.primary }}
        >
          Condições
        </h2>
        <div 
          className="rounded-lg p-6"
          style={{ backgroundColor: theme.surface }}
        >
          <ul className="space-y-3 text-sm" style={{ color: theme.textSecondary }}>
            <li className="flex items-center gap-2">
              <span style={{ color: theme.primary }}>•</span>
              Este orçamento tem validade de 7 dias a partir da data de emissão.
            </li>
            {shouldDisplayValue(safeRecurringTotal) && (
              <li className="flex items-center gap-2">
                <span style={{ color: theme.primary }}>•</span>
                Os valores mensais são cobrados após a entrega do projeto relativos a manutenção.
              </li>
            )}

            <li className="flex items-center gap-2">
              <span style={{ color: theme.primary }}>•</span>
              Duração do contrato: {serviceConfig.contractDuration} meses.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}