interface Props {
  title: string;
  subtitle: string;
  stepName: string;
}

export default function StepIndicator({ title, subtitle }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-sm text-[#B8B8B8]">{subtitle}</p>
    </div>
  );
}