import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { StorageClient } from "./StorageClient";

export function useFileUpload() {
  const { identity } = useInternetIdentity();

  const uploadFile = async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> => {
    try {
      const config = await loadConfig();
      if (config.storage_gateway_url === "nogateway") {
        // Demo mode – return a placeholder ID
        return `demo_${Date.now()}_${encodeURIComponent(file.name)}`;
      }
      const agent = new HttpAgent({
        identity: identity ?? undefined,
        host: config.backend_host,
      });
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, onProgress);
      return hash;
    } catch (err) {
      console.warn("Storage upload failed, using placeholder:", err);
      return `demo_${Date.now()}_${encodeURIComponent(file.name)}`;
    }
  };

  return { uploadFile };
}
