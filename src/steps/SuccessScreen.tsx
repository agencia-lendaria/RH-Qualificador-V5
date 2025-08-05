import { useRef, useState, useEffect } from 'react';
import type { ServiceConfig, IncludedItem, PersonalData } from '../types';
import { PREDEFINED_THEMES } from '../types';
import BudgetTemplate from '../components/BudgetTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

interface Props {
  email: string;
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

export default function SuccessScreen({ 
  personalData,
  serviceConfig,
  includedItems,
  pricing,
  timestamp 
}: Props) {
  const budgetRef = useRef<HTMLDivElement>(null);
  const [pdfData, setPdfData] = useState<{
    personalData: PersonalData;
    serviceConfig: ServiceConfig;
    includedItems: IncludedItem[];
    pricing: Props['pricing'];
    timestamp: string;
  }>({ personalData, serviceConfig, includedItems, pricing, timestamp });

  // Effect to update PDF data only
  useEffect(() => {
    setPdfData({ personalData, serviceConfig, includedItems, pricing, timestamp });
  }, [personalData, serviceConfig, includedItems, pricing, timestamp]);

  const handleDownloadPDF = async () => {
    if (!budgetRef.current) return;

    try {
      const canvas = await html2canvas(budgetRef.current, {
        scale: 2,
        backgroundColor: '#161616',
        windowWidth: 842,
        windowHeight: 1190,
      });

      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm',
        orientation: 'portrait'
      });

      const pageWidth = 210;
      const pageHeight = 297;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        pageWidth,
        pageHeight
      );

      pdf.save(`orcamento-${pdfData.serviceConfig.serviceType}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Orçamento Gerado com Sucesso!</h2>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 bg-[#CABD95] text-[#161616] px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Baixar PDF
            </button>
          </div>

          <div className="hidden lg:block">
            <div ref={budgetRef} className="w-[842px] h-[1190px] mx-auto">
              <BudgetTemplate
                personalData={pdfData.personalData}
                serviceConfig={pdfData.serviceConfig}
                includedItems={pdfData.includedItems}
                pricing={pdfData.pricing}
                timestamp={pdfData.timestamp}
              />
            </div>
          </div>

          <div className="lg:hidden">
            <div ref={budgetRef} className="w-full bg-[#161616] rounded-lg overflow-hidden">
              <BudgetTemplate
                personalData={pdfData.personalData}
                serviceConfig={pdfData.serviceConfig}
                includedItems={pdfData.includedItems}
                pricing={pdfData.pricing}
                timestamp={pdfData.timestamp}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#B8B8B8] text-sm">
              Seu orçamento foi gerado com sucesso! Clique no botão acima para baixar o PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}