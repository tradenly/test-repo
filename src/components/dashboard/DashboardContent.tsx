
import { DashboardSection } from "@/pages/Dashboard";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardSectionRenderer } from "./DashboardSectionRenderer";

interface DashboardContentProps {
  activeSection: DashboardSection;
  user: UnifiedUser;
}

export const DashboardContent = ({ activeSection, user }: DashboardContentProps) => {
  return (
    <DashboardLayout>
      <DashboardSectionRenderer activeSection={activeSection} user={user} />
    </DashboardLayout>
  );
};
