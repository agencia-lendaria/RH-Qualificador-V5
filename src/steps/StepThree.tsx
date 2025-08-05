import { useState, useEffect } from 'react';
import type { IncludedItem, ServiceConfig } from '../types';
import { DEFAULT_INCLUDED_ITEMS } from '../types';
import StepIndicator from '../components/StepIndicator';
import NavigationButtons from '../components/NavigationButtons';
import { Settings, ArrowRightLeft, Check, Trash2, Minus, Lock } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import CurrencyInput from '../components/CurrencyInput';

interface Props {
  includedItems: IncludedItem[];
  serviceConfig: ServiceConfig; // Add service config to access current pricing
  onBack: () => void;
  onNext: (items: IncludedItem[]) => void;
  onUpdateItems: (items: IncludedItem[]) => void;
}

export default function StepThree({ includedItems, serviceConfig, onBack, onNext, onUpdateItems }: Props) {
  const [localItems, setLocalItems] = useState<IncludedItem[]>(includedItems);
  const [customItem, setCustomItem] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [originalItems, setOriginalItems] = useState<IncludedItem[]>(DEFAULT_INCLUDED_ITEMS);

  // Initialize with the provided includedItems (already filtered by service type)
  useEffect(() => {
    setLocalItems(includedItems);
    setOriginalItems(DEFAULT_INCLUDED_ITEMS); // Keep reference to all original items
    onUpdateItems(includedItems);
  }, [includedItems, onUpdateItems]);



  const handleToggleItem = (item: IncludedItem) => {
    // Don't toggle if currently editing another item
    if (editingItem && editingItem !== item.id) {
      return;
    }
    
    // Prevent removal of required items
    if (item.required) {
      return;
    }
    
    const exists = localItems.some((i) => i.id === item.id);
    let newItems: IncludedItem[];
    
    if (exists) {
      // Remove the item
      newItems = localItems.filter((i) => i.id !== item.id);
    } else {
      // Add the item back - find it in original items to get the correct data
      const originalItem = originalItems.find(oi => oi.id === item.id);
      if (originalItem) {
        newItems = [...localItems, { ...originalItem }];
      } else {
        newItems = [...localItems, { ...item }];
      }
    }
    
    setLocalItems(newItems);
    onUpdateItems(newItems);
  };

  // Calculate the total value of removed features (positive values that reduce the price)
  const calculateRemovedFeaturesValue = () => {
    // Get available items based on service type
    const availableItems = originalItems.filter(item => {
      // Remove meeting feature (ID '7') for agente-closer
      if (serviceConfig.serviceType === 'agente-closer' && item.id === '7') {
        return false;
      }
      return true;
    });
    
    const removedItems = availableItems.filter(defaultItem => 
      !localItems.some(item => item.id === defaultItem.id)
    );
    
    return removedItems.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  };

  // Calculate the total value of features set to 0 (not applicable with negative pricing)
  const calculateZeroPriceFeaturesValue = () => {
    return 0; // No zero-price features in this model
  };

  // Calculate the suggested base value reduction
  const getSuggestedBaseValue = () => {
    const removedValue = calculateRemovedFeaturesValue();
    const zeroPriceValue = calculateZeroPriceFeaturesValue();
    const currentBaseValue = serviceConfig.baseValue || 25000;
    const suggestedValue = Math.max(15000, currentBaseValue - removedValue - zeroPriceValue);
    return suggestedValue;
  };

  const handlePriceToggle = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (editingItem === itemId) {
      setEditingItem(null);
      setEditingPrice(0);
    } else {
      const item = localItems.find(i => i.id === itemId);
      setEditingItem(itemId);
      setEditingPrice(item?.price || 0);
    }
  };

  const handleUpdateItemPrice = (itemId: string, price: number) => {
    setEditingPrice(price);
  };

  const handleConfirmPrice = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    
    // Update the item with the new price (allow 0 as a valid price)
    const newItems = localItems.map(item =>
      item.id === itemId
        ? { ...item, price: editingPrice >= 0 ? editingPrice : undefined }
        : item
    );
    
    setLocalItems(newItems);
    onUpdateItems(newItems);
    
    // Clear editing state
    setEditingItem(null);
    setEditingPrice(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmPrice(e as any, itemId);
    }
  };

  const handleToggleRecurring = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const newItems = localItems.map(item =>
      item.id === itemId
        ? { ...item, isRecurring: !item.isRecurring }
        : item
    );
    setLocalItems(newItems);
    onUpdateItems(newItems);
  };

  const handleAddCustomItem = () => {
    if (!customItem.trim()) return;
    
    const newItem: IncludedItem = {
      id: `custom-${Date.now()}`,
      label: customItem.trim(),
      custom: true,
      isRecurring: false,
      price: 0
    };
    
    const newItems = [...localItems, newItem];
    setLocalItems(newItems);
    onUpdateItems(newItems);
    setCustomItem('');
  };

  const handleRemoveCustomItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const newItems = localItems.filter(item => item.id !== itemId);
    setLocalItems(newItems);
    onUpdateItems(newItems);
  };

  const isNextDisabled = () => {
    return false; // Always allow next since we start with all features
  };

  const getItemLabel = (isRecurring: boolean | undefined, price: number | undefined) => {
    if (isRecurring) return 'Mensal';
    if (price && price > 0) return 'Único';
    return 'Bônus';
  };

  const renderItem = (item: IncludedItem) => {
    const isSelected = localItems.some((i) => i.id === item.id);
    const isEditing = editingItem === item.id;
    const hasPrice = item.price && item.price > 0;
    const isRequired = item.required;

    return (
      <div
        key={item.id}
        className={`service-card transition-all duration-300 ${
          isRequired 
            ? 'selected cursor-default' 
            : isSelected 
              ? 'selected cursor-pointer' 
              : 'opacity-60 hover:opacity-80 cursor-pointer'
        }`}
        onClick={() => !isRequired && handleToggleItem(item)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`service-icon ${isRequired ? 'bg-green-600' : ''}`}>
              {isSelected ? (
                <Check className="w-5 h-5 text-[#161616]" />
              ) : isRequired ? (
                <Lock className="w-5 h-5 text-[#161616]" />
              ) : (
                <Minus className="w-5 h-5 text-[#161616]" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{item.label}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.isRecurring 
                    ? 'bg-blue-900/20 text-blue-300' 
                    : 'bg-green-900/20 text-green-300'
                }`}>
                  {getItemLabel(item.isRecurring, item.price)}
                </span>
                {isRequired && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300">
                    Obrigatório
                  </span>
                )}
                {hasPrice && (
                  <span className="text-[#CABD95] font-medium">
                    {formatCurrency(item.price!)}
                    {item.isRecurring ? '/mês' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.custom && (
              <button
                onClick={(e) => handleRemoveCustomItem(e, item.id)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Remover item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            {hasPrice && (
              <button
                onClick={(e) => handlePriceToggle(e, item.id)}
                className="p-1 text-[#CABD95] hover:text-white transition-colors"
                title="Editar preço"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => handleToggleRecurring(e, item.id)}
              className={`p-1 rounded transition-colors ${
                item.isRecurring 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
              title={item.isRecurring ? 'Cobrança mensal' : 'Cobrança única'}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 p-4 bg-[#1D1D22] rounded-lg border border-[#2A2A2D]">
            <div className="space-y-4">
              {/* Scrollable Price Toggle */}
              <div>
                <span className="text-sm text-[#B8B8B8] block mb-3">Selecionar Preço:</span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000].map((price) => (
                    <button
                      key={price}
                      onClick={() => handleUpdateItemPrice(item.id, price)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                        editingPrice === price
                          ? 'border-[#CABD95] bg-[#CABD95] text-[#161616]'
                          : 'border-[#2A2A2D] hover:border-[#CABD95]/50 text-white hover:bg-[#2A2A2D]/50'
                      }`}
                    >
                      {price === 0 ? 'Grátis' : formatCurrency(price)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Price Input */}
              <div>
                <span className="text-sm text-[#B8B8B8] block mb-2">Preço Personalizado:</span>
                <div className="flex items-center gap-3">
                  <CurrencyInput
                    value={editingPrice}
                    onChange={(value) => handleUpdateItemPrice(item.id, value)}
                    placeholder="0,00"
                    className="flex-1"
                    onKeyPress={(e) => handleKeyPress(e, item.id)}
                  />
                  <button
                    onClick={(e) => handleConfirmPrice(e, item.id)}
                    className="px-4 py-2 bg-[#CABD95] text-[#161616] rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(null);
                      setEditingPrice(0);
                    }}
                    className="px-4 py-2 border border-[#2A2A2D] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A2D] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <StepIndicator
        stepName="Recursos"
        title="Personalize seu Pacote"
        subtitle="Remova recursos para reduzir o preço. Valor base R$ 15k + recursos adicionais até R$ 25k."
      />

      <div className="space-y-6">
        {/* Required Items Info */}
        <div className="bg-[#1D1D22] rounded-lg p-4 border border-green-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Recursos Obrigatórios</h3>
              <p className="text-sm text-[#B8B8B8] mb-2">
                Os seguintes recursos são obrigatórios e garantem o valor mínimo de R$ 2.000/mês para manutenção:
              </p>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Grupo de Suporte dedicado</li>
                <li>• Manutenções Técnicas</li>
                <li>• Acesso às Novas Atualizações de Performance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Removal Impact */}
        {calculateRemovedFeaturesValue() > 0 && (
          <div className="bg-[#1D1D22] rounded-lg p-4 border border-[#CABD95]/20">
            <h3 className="text-lg font-semibold text-[#CABD95] mb-3">Economia por Remoção de Recursos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#B8B8B8]">Valor dos recursos removidos:</span>
                <span className="text-green-400">-{formatCurrency(calculateRemovedFeaturesValue())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B8B8B8]">Valor base (mínimo):</span>
                <span className="text-white">{formatCurrency(15000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B8B8B8]">Valor final sugerido:</span>
                <span className="text-[#CABD95] font-medium">{formatCurrency(15000 + (10000 - calculateRemovedFeaturesValue()))}</span>
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">
                💡 Dica: Remover recursos reduz o preço. O valor mínimo é R$ 15.000
              </p>
            </div>
          </div>
        )}

        {/* Default Items */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recursos Inclusos</h3>
          <div className="space-y-4">
            {originalItems
              .filter(item => !item.custom)
              .filter(item => {
                // Remove meeting feature (ID '7') for agente-closer
                if (serviceConfig.serviceType === 'agente-closer' && item.id === '7') {
                  return false;
                }
                return true;
              })
              .map(renderItem)
            }
          </div>
        </div>


        


        {/* Custom Items */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recursos Personalizados</h3>
          <div className="space-y-4">
            {localItems
              .filter(item => item.custom)
              .map(renderItem)
            }
          </div>
          
          {/* Add Custom Item */}
          <div className="mt-4 p-4 border-2 border-dashed border-[#2A2A2D] rounded-lg">
            <div className="flex gap-3">
              <input
                type="text"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                placeholder="Adicionar recurso personalizado..."
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomItem();
                  }
                }}
              />
              <button
                onClick={handleAddCustomItem}
                disabled={!customItem.trim()}
                className="px-4 py-3 bg-[#CABD95] text-[#161616] rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={() => onNext(localItems)}
        nextLabel="Continuar"
        isNextDisabled={isNextDisabled()}
      />
    </div>
  );
}