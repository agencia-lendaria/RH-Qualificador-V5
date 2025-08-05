import { useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import type { ServiceConfig, IncludedItem, PersonalData } from '../types';
import StepIndicator from '../components/StepIndicator';
import NavigationButtons from '../components/NavigationButtons';

interface Props {
  personalData: PersonalData;
  onBack: () => void;
  onSubmit: (data: PersonalData) => void;
  serviceConfig: ServiceConfig;
  includedItems: IncludedItem[];
  pricing: any;
}

export default function StepSeven({ 
  personalData, 
  onBack, 
  onSubmit,
  serviceConfig,
  includedItems,
  pricing
}: Props) {
  const [agencyName, setAgencyName] = useState(personalData.agencyName || '');
  const [logoFile, setLogoFile] = useState<File | null>(personalData.logoFile || null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(personalData.logoDataUrl || null);
  const [logoError, setLogoError] = useState<string>('');

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setLogoError('Por favor, selecione apenas arquivos de imagem (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('O arquivo deve ter no máximo 5MB');
      return;
    }

    setLogoError('');
    setLogoFile(file);

    // Convert to data URL for preview and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoDataUrl(null);
    setLogoError('');
  };

  const handleSubmit = () => {
    const finalData: PersonalData = {
      ...personalData,
      agencyName: agencyName.trim() || 'Sua Agência',
      logoFile: logoFile || undefined,
      logoDataUrl: logoDataUrl || undefined
    };
    onSubmit(finalData);
  };

  return (
    <div>
      <StepIndicator
        stepName="Finalização"
        title="Quase pronto!"
        subtitle="Informe o nome da sua agência para personalizar o orçamento"
      />

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-[#B8B8B8] mb-2">
            Nome da Agência
          </label>
          <input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="input"
            placeholder="Digite o nome da sua agência"
            autoFocus
          />
          <p className="text-xs text-[#A0A0A0] mt-1">
            Este nome aparecerá no cabeçalho do orçamento gerado
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm text-[#B8B8B8] mb-2">
            Logo da Agência (opcional)
          </label>
          
          {!logoDataUrl ? (
            <div className="border-2 border-dashed border-[#2A2A2D] rounded-lg p-4 sm:p-6 text-center hover:border-[#CABD95] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="p-3 bg-[#242424] rounded-lg">
                  <Upload className="w-6 h-6 text-[#CABD95]" />
                </div>
                <div>
                  <p className="text-white font-medium">Clique para fazer upload</p>
                  <p className="text-xs text-[#A0A0A0] mt-1 px-2">
                    PNG, JPG ou outros formatos de imagem (máx. 5MB)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative">
              <div className="border border-[#2A2A2D] rounded-lg p-4 bg-[#1D1D22]">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={logoDataUrl}
                      alt="Logo preview"
                      className="w-20 h-20 sm:w-16 sm:h-16 object-contain rounded-lg bg-white/10"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-white font-medium">{logoFile?.name}</p>
                    <p className="text-xs text-[#A0A0A0]">
                      {logoFile && (logoFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-400/10"
                    title="Remover logo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <label
                  htmlFor="logo-upload"
                  className="text-sm text-[#CABD95] hover:text-white cursor-pointer transition-colors"
                >
                  Alterar logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
              </div>
            </div>
          )}
          
          {logoError && (
            <p className="text-red-400 text-xs mt-2">{logoError}</p>
          )}
          
          <p className="text-xs text-[#A0A0A0] mt-2">
            O logo aparecerá no canto superior direito do orçamento
          </p>
        </div>
        <div className="bg-[#1D1D22] rounded-lg p-4">
          <h3 className="text-lg font-medium text-[#CABD95] mb-2">
            Resumo do Orçamento
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#B8B8B8]">Serviço:</span>
              <span className="text-white text-right">{serviceConfig.serviceTypeName}</span>
            </div>
            {serviceConfig.serviceType !== 'outros' && (
              <div className="flex justify-between">
                <span className="text-[#B8B8B8]">Quantidade:</span>
                <span className="text-white">{serviceConfig.quantity}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#B8B8B8]">Valor Total:</span>
              <span className="text-[#CABD95] font-medium text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(pricing.projectTotal)}
              </span>
            </div>
            {pricing.recurringTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-[#B8B8B8]">Valor Mensal:</span>
                <span className="text-[#CABD95] font-medium text-right">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(pricing.recurringTotal)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Color Theme Preview - Mostrando todas as 6 cores */}
        {serviceConfig.colorTheme && (
          <div className="bg-[#1D1D22] rounded-lg p-4">
            <h3 className="text-lg font-medium text-[#CABD95] mb-3">
              Tema de Cores Selecionado
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border border-[#2A2A2D]"
                  style={{ backgroundColor: serviceConfig.colorTheme.primary }}
                  title="Cor Primária"
                />
                <div 
                  className="w-8 h-8 rounded-lg border border-[#2A2A2D]"
                  style={{ backgroundColor: serviceConfig.colorTheme.secondary }}
                  title="Cor Secundária"
                />
                <div 
                  className="w-8 h-8 rounded-lg border border-[#2A2A2D]"
                  style={{ backgroundColor: serviceConfig.colorTheme.accent }}
                  title="Cor de Acento"
                />
                <div 
                  className="w-8 h-8 rounded-lg border border-[#2A2A2D]"
                  style={{ backgroundColor: serviceConfig.colorTheme.background }}
                  title="Fundo"
                />
                <div 
                  className="w-8 h-8 rounded-lg border border-[#2A2A2D]"
                  style={{ backgroundColor: serviceConfig.colorTheme.surface }}
                  title="Superfície"
                />
                <div 
                  className="w-8 h-8 rounded-lg border border-[#2A2A2D]"
                  style={{ backgroundColor: serviceConfig.colorTheme.text }}
                  title="Texto Principal"
                />
              </div>
              <span className="text-sm text-[#B8B8B8]">
                Cores personalizadas aplicadas ao orçamento
              </span>
            </div>
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel="Gerar Orçamento"
        isNextDisabled={false}
      />
    </div>
  );
}