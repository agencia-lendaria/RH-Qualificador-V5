import { useState } from 'react';
import type { ServiceConfig, ColorTheme } from '../types';
import { DEFAULT_COLOR_THEME, PREDEFINED_THEMES } from '../types';
import StepIndicator from '../components/StepIndicator';
import NavigationButtons from '../components/NavigationButtons';
import ColorPicker from '../components/ColorPicker';
import { Palette, Briefcase, Sparkles, Infinity, Leaf, Eye, Info } from 'lucide-react';

// Icons for each theme
const THEME_ICONS: Record<string, React.ComponentType<any>> = {
  lendario: Infinity,      // ♾️ Logo Infinito para Academia Lendária
  profissional: Briefcase, // 💼 Maleta para Profissional
  elegante: Sparkles,      // ✨ Estrelas para Elegante
  natural: Leaf           // 🌿 Folha para Natural
};

// Theme names and descriptions in Portuguese
const THEME_INFO: Record<string, { name: string; description: string }> = {
  lendario: { 
    name: 'Lendário', 
    description: 'Academia Lendária'
  },
  profissional: { 
    name: 'Profissional', 
    description: 'Confiança Corporativa'
  },
  elegante: { 
    name: 'Elegante', 
    description: 'Sofisticação Premium'
  },
  natural: { 
    name: 'Natural', 
    description: 'Natureza & Sustentabilidade'
  }
};

interface Props {
  serviceConfig: ServiceConfig;
  onBack: () => void;
  onNext: (config: ServiceConfig) => void;
  onUpdateConfig: (updates: Partial<ServiceConfig>) => void;
}

export default function StepSix({ serviceConfig, onBack, onNext, onUpdateConfig }: Props) {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(
    serviceConfig.colorTheme || DEFAULT_COLOR_THEME
  );
  const [selectedPreset, setSelectedPreset] = useState<string>('lendario');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Mudança aqui: começa oculta
  const [showWcagTooltip, setShowWcagTooltip] = useState(false);

  const handleThemeChange = (updates: Partial<ColorTheme>) => {
    const newTheme = { ...currentTheme, ...updates };
    setCurrentTheme(newTheme);
    setSelectedPreset('custom');
    onUpdateConfig({ colorTheme: newTheme });
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = PREDEFINED_THEMES[presetName];
    if (preset) {
      setCurrentTheme(preset);
      setSelectedPreset(presetName);
      onUpdateConfig({ colorTheme: preset });
    }
  };

  const handleNext = () => {
    onNext({
      ...serviceConfig,
      colorTheme: currentTheme
    });
  };

  return (
    <div>
      <StepIndicator
        stepName="Personalização"
        title="Personalize as Cores do Orçamento"
        subtitle="Escolha as cores que representam sua marca no orçamento"
      />

      <div className="space-y-8">
        {/* Preset Themes */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#CABD95]" />
            Temas Predefinidos
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {Object.entries(PREDEFINED_THEMES).map(([name, theme]) => {
              const IconComponent = THEME_ICONS[name];
              const themeInfo = THEME_INFO[name];
              const isLendario = name === 'lendario';
              
              return (
                <button
                  key={name}
                  onClick={() => handlePresetSelect(name)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedPreset === name
                      ? 'border-[#CABD95] bg-gradient-to-br from-[#1D1D22] to-[#242424]'
                      : 'border-[#2A2A2D] hover:border-[#CABD95]/50 hover:bg-[#1D1D22]/50'
                  }`}
                >
                  {/* Badge Padrão para Lendário */}
                  {isLendario && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#CABD95] to-[#D4C7A0] text-black text-xs px-2 py-1 rounded-full font-bold">
                      Padrão
                    </div>
                  )}
                  
                  {/* Header com Ícone e Nome */}
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: theme.primary
                      }}
                    >
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ 
                          color: theme.background 
                        }} 
                      />
                    </div>
                    <div className="text-left flex-1">
                      <span className="text-base font-bold block text-white">
                        {themeInfo.name}
                      </span>
                      <span className="text-xs text-[#A0A0A0] block">
                        {themeInfo.description}
                      </span>
                    </div>
                  </div>
                  
                  {/* Color Palette Preview - Agora mostrando todas as 6 cores */}
                  <div className="flex gap-1 mb-3">
                    <div 
                      className="w-5 h-5 rounded-lg border-2 border-white/30"
                      style={{ backgroundColor: theme.background }}
                      title="Fundo"
                    />
                    <div 
                      className="w-5 h-5 rounded-lg border-2 border-white/30"
                      style={{ backgroundColor: theme.surface }}
                      title="Superfície"
                    />
                    <div 
                      className="w-5 h-5 rounded-lg border-2 border-white/30"
                      style={{ backgroundColor: theme.primary }}
                      title="Primária"
                    />
                    <div 
                      className="w-5 h-5 rounded-lg border-2 border-white/30"
                      style={{ backgroundColor: theme.secondary }}
                      title="Secundária"
                    />
                    <div 
                      className="w-5 h-5 rounded-lg border-2 border-white/30"
                      style={{ backgroundColor: theme.text }}
                      title="Texto Principal"
                    />
                    <div 
                      className="w-5 h-5 rounded-lg border-2 border-white/30"
                      style={{ backgroundColor: theme.textSecondary }}
                      title="Texto Secundário"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Color Controls */}
        <div>
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[#CABD95] hover:text-white transition-colors text-sm flex items-center justify-center gap-2 bg-[#242424] px-4 py-3 rounded-lg min-h-[48px]"
            >
              <Palette className="w-4 h-4" />
              {showAdvanced ? 'Ocultar' : 'Mostrar'} Personalização Avançada
            </button>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-[#CABD95] hover:text-white transition-colors text-sm flex items-center justify-center gap-2 bg-[#242424] px-4 py-3 rounded-lg min-h-[48px]"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Ocultar' : 'Mostrar'} Prévia do Orçamento
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-6 animate-fadeIn bg-[#1A1A1C] p-6 rounded-xl border border-[#2A2A2D]">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-lg font-semibold text-white">Personalização Avançada</h4>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowWcagTooltip(true)}
                    onMouseLeave={() => setShowWcagTooltip(false)}
                    onClick={() => setShowWcagTooltip(!showWcagTooltip)}
                    className="text-[#CABD95] hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  
                  {showWcagTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 md:w-80 bg-[#161616] border border-[#2A2A2D] rounded-lg p-4 shadow-xl z-10">
                      <div className="text-sm space-y-2">
                        <h5 className="font-semibold text-[#CABD95] mb-2">WCAG</h5>
                        <p className="text-[#B8B8B8]">
                          São diretrizes internacionais para tornar o conteúdo web mais acessível e legível.
                        </p>
                        <div className="space-y-1">
                          <p className="text-[#A0A0A0]"><strong>AAA:</strong> Contraste excelente (7:1) - Padrão mais rigoroso</p>
                          <p className="text-[#A0A0A0]"><strong>AA:</strong> Contraste bom (4.5:1) - Padrão recomendado</p>
                          <p className="text-[#A0A0A0]"><strong>Fail:</strong> Contraste insuficiente - Pode causar dificuldades</p>
                        </div>
                        <p className="text-xs text-[#888] mt-2">
                          As cores são automaticamente validadas para garantir legibilidade adequada.
                        </p>
                      </div>
                      {/* Seta do tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2A2A2D]"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <ColorPicker
                  label="Cor Primária"
                  value={currentTheme.primary}
                  onChange={(color) => handleThemeChange({ primary: color })}
                  testBackground={currentTheme.background}
                  description="Cor principal da marca, usada em destaques e botões"
                />

                <ColorPicker
                  label="Cor Secundária"
                  value={currentTheme.secondary}
                  onChange={(color) => handleThemeChange({ secondary: color })}
                  testBackground={currentTheme.background}
                  description="Cor complementar para elementos secundários"
                />

                <ColorPicker
                  label="Fundo Principal"
                  value={currentTheme.background}
                  onChange={(color) => handleThemeChange({ background: color })}
                  testBackground={currentTheme.text}
                  description="Cor de fundo do documento"
                />

                <ColorPicker
                  label="Superfície"
                  value={currentTheme.surface}
                  onChange={(color) => handleThemeChange({ surface: color })}
                  testBackground={currentTheme.text}
                  description="Cor de fundo para cards e seções"
                />

                <ColorPicker
                  label="Texto Principal"
                  value={currentTheme.text}
                  onChange={(color) => handleThemeChange({ text: color })}
                  testBackground={currentTheme.background}
                  description="Cor do texto principal"
                />

                <ColorPicker
                  label="Texto Secundário"
                  value={currentTheme.textSecondary}
                  onChange={(color) => handleThemeChange({ textSecondary: color })}
                  testBackground={currentTheme.background}
                  description="Cor do texto secundário e legendas"
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Preview */}
        {showPreview && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-medium text-white mb-4">Prévia do Orçamento</h3>
            <div 
              className="p-4 md:p-8 rounded-xl border-2 transition-all duration-500 shadow-2xl"
              style={{ 
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.border,
                color: currentTheme.text
              }}
            >
              <div 
                className="p-4 md:p-6 rounded-lg mb-6 transition-all duration-500"
                style={{ backgroundColor: currentTheme.surface }}
              >
                <h4 
                  className="text-lg md:text-xl font-bold mb-3 transition-all duration-500"
                  style={{ color: currentTheme.primary }}
                >
                  Orçamento Academia Lendária
                </h4>
                <p 
                  className="text-sm md:text-base transition-all duration-500"
                  style={{ color: currentTheme.textSecondary }}
                >
                  Emitido em: 25/03/2025 | Válido até: 01/04/2025
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base" style={{ color: currentTheme.textSecondary }}>Valor Base:</span>
                  <span className="text-sm md:text-base font-medium" style={{ color: currentTheme.text }}>R$ 24.000,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base" style={{ color: currentTheme.textSecondary }}>Recursos Adicionais:</span>
                  <span className="text-sm md:text-base font-medium" style={{ color: currentTheme.secondary }}>+R$ 2.500,00</span>
                </div>
                <div 
                  className="h-[2px] my-4 transition-all duration-500"
                  style={{ backgroundColor: currentTheme.border }}
                ></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base md:text-lg">Total do Projeto:</span>
                  <span 
                    className="font-bold text-lg md:text-2xl transition-all duration-500"
                    style={{ color: currentTheme.primary }}
                  >
                    R$ 26.500,00
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={handleNext}
        nextLabel="Continuar"
        isNextDisabled={false}
      />
    </div>
  );
}