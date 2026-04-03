import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import MetricsGrid from "@/components/analytics/MetricsGrid";
import DeploymentVisualizer from "@/components/analytics/DeploymentVisualizer";
import TechnicalLogs from "@/components/analytics/TechnicalLogs";

export default function AnalyticsPage() {
  return (
    <main className="flex-1 min-h-[calc(100vh-124px)] bg-[#f9f9f9] relative blueprint-grid p-16">
      <AnalyticsHeader />
      <MetricsGrid />
      <DeploymentVisualizer />
      <TechnicalLogs />
    </main>
  );
}
