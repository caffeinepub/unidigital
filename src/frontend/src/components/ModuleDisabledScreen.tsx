import { Lock, ShieldOff } from "lucide-react";
import { Button } from "./ui/button";

interface ModuleDisabledScreenProps {
  moduleName: string;
  onBack?: () => void;
}

export function ModuleDisabledScreen({
  moduleName,
  onBack,
}: ModuleDisabledScreenProps) {
  const disabledDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
      data-ocid="module.disabled.screen"
    >
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 border-2 border-red-100">
        <ShieldOff size={36} className="text-red-500" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Module Disabled
      </h2>

      <div className="flex items-center gap-2 mb-4">
        <Lock size={14} className="text-red-500" />
        <span className="text-base font-semibold text-red-600">
          {moduleName}
        </span>
      </div>

      <p className="text-slate-500 max-w-md mb-2">
        This module has been disabled by the system administrator and is
        currently unavailable.
      </p>

      <p className="text-xs text-slate-400 mb-8">
        Disabled as of {disabledDate} &middot; Contact your system administrator
        to re-enable access.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            data-ocid="module.disabled.back"
          >
            ← Go Back
          </Button>
        )}
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => window.location.reload()}
          data-ocid="module.disabled.refresh"
        >
          Refresh Page
        </Button>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        If you believe this is an error, please contact the Admin at your
        institution.
      </p>
    </div>
  );
}
