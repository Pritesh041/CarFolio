import { EmptyState } from "../components/ui/EmptyState";

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ComingSoonPage({ eyebrow, title, description }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-offwhite">{title}</h1>
      <EmptyState eyebrow={eyebrow} title="Coming soon" description={description} />
    </div>
  );
}
