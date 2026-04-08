import type { ReactNode } from "react";
import { useModuleGating } from "../contexts/ModuleGatingContext";
import { ModuleDisabledScreen } from "./ModuleDisabledScreen";

interface GatedRouteProps {
  pageKey: string;
  children: ReactNode;
  onBack?: () => void;
}

/**
 * Wraps a page/route and shows ModuleDisabledScreen if the module is disabled
 * in InstitutionSettings. Falls through to children when the module is enabled.
 */
export function GatedRoute({ pageKey, children, onBack }: GatedRouteProps) {
  const { isModuleEnabled, getDisabledModuleName } = useModuleGating();

  if (!isModuleEnabled(pageKey)) {
    const moduleName = getDisabledModuleName(pageKey) ?? pageKey;
    return <ModuleDisabledScreen moduleName={moduleName} onBack={onBack} />;
  }

  return <>{children}</>;
}
