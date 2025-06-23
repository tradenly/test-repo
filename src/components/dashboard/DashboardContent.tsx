
import { DashboardSection } from "@/pages/Dashboard";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardSectionRenderer } from "./DashboardSectionRenderer";

interface DashboardContentProps {
  activeSection: DashboardSection;
  user: UnifiedUser;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardContent = ({ activeSection, user, onSectionChange }: DashboardContentProps) => {
  return (
    <DashboardLayout>
      <DashboardSectionRenderer activeSection={activeSection} user={user} onSectionChange={onSectionChange} />
    </DashboardLayout>
  );
};
