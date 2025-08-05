import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
  onFinish?: () => void;
}

export default function NavigationButtons({
  onBack,
  onNext,
  nextLabel = 'Continuar',
  isNextDisabled = false,
  isLastStep = false,
  onFinish
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-8 navigation-buttons">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-[#B8B8B8] hover:text-white transition-colors w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg border border-[#2A2A2D] hover:border-[#CABD95]/50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Anterior</span>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}
      {isLastStep ? (
        <button
          onClick={onFinish}
          disabled={isNextDisabled}
          className="flex items-center justify-center gap-2 bg-[#CABD95] text-[#161616] hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px] px-6 py-2 rounded-lg font-medium"
        >
          <span className="text-sm">Finalizar</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      ) : (
        onNext && (
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center justify-center gap-2 bg-[#CABD95] text-[#161616] hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px] px-6 py-2 rounded-lg font-medium"
          >
            <span className="text-sm">{nextLabel}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )
      )}
    </div>
  );
}