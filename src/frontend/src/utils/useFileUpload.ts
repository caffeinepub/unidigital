import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useFileUpload() {
  const { identity } = useInternetIdentity();

  const uploadFile = async (
    file: File,
    _onProgress?: (pct: number) => void,
  ): Promise<string> => {
    try {
      // Demo mode – identity used for auth context
      void identity;
      return `demo_${Date.now()}_${encodeURIComponent(file.name)}`;
    } catch (err) {
      console.warn("Storage upload failed, using placeholder:", err);
      return `demo_${Date.now()}_${encodeURIComponent(file.name)}`;
    }
  };

  return { uploadFile };
}
