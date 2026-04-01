import {
  Camera,
  FileText,
  ImageIcon,
  Loader2,
  SwitchCamera,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface DocumentScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
  title?: string;
  acceptedTypes?: string;
}

export function DocumentScanner({
  isOpen,
  onClose,
  onCapture,
  title = "Scan or Upload Document",
  acceptedTypes = "image/*,application/pdf",
}: DocumentScannerProps) {
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("camera");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment" });

  // Start camera when Camera tab becomes active and dialog is open
  useEffect(() => {
    if (isOpen && activeTab === "camera" && isSupported && !capturedPreview) {
      startCamera();
    }
    return () => {
      if (activeTab !== "camera" || !isOpen) {
        stopCamera();
      }
    };
  }, [
    isOpen,
    activeTab,
    isSupported,
    capturedPreview,
    startCamera,
    stopCamera,
  ]);

  // Stop camera when dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      setCapturedFile(null);
    }
  }, [isOpen, stopCamera]);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedPreview(url);
      setCapturedFile(file);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedPreview(url);
    setCapturedFile(file);
  };

  const handleConfirm = () => {
    if (!capturedFile || !capturedPreview) return;
    onCapture(capturedFile, capturedPreview);
    onClose();
  };

  const handleRetake = () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedPreview(null);
    setCapturedFile(null);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const isPDF = capturedFile?.type === "application/pdf";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg w-full" data-ocid="scanner.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera size={18} className="text-blue-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            setCapturedPreview(null);
            setCapturedFile(null);
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger
              value="camera"
              className="flex-1"
              data-ocid="scanner.tab"
            >
              <Camera size={14} className="mr-1.5" />
              Camera
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="flex-1"
              data-ocid="scanner.tab"
            >
              <Upload size={14} className="mr-1.5" />
              Upload File
            </TabsTrigger>
          </TabsList>

          {/* Camera tab */}
          <TabsContent value="camera" className="mt-4">
            {isSupported === false ? (
              <div className="text-center py-8 text-slate-400">
                <Camera size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  Camera is not supported in this browser. Please use the Upload
                  tab.
                </p>
              </div>
            ) : capturedPreview ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  {isPDF ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-slate-100">
                      <FileText size={48} className="text-blue-500 mb-2" />
                      <p className="text-sm text-slate-600">PDF Captured</p>
                    </div>
                  ) : (
                    <img
                      src={capturedPreview}
                      alt="Captured document"
                      className="w-full object-contain max-h-64"
                    />
                  )}
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0">
                    Captured
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1"
                    data-ocid="scanner.secondary_button"
                  >
                    <X size={14} className="mr-1.5" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-ocid="scanner.confirm_button"
                  >
                    Use This Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Camera preview */}
                <div
                  className="relative rounded-lg overflow-hidden bg-black"
                  style={{ aspectRatio: "16/9" }}
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Loader2 size={32} className="animate-spin text-white" />
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                      <Camera size={32} className="text-slate-400 mb-2" />
                      <p className="text-sm text-slate-300 text-center">
                        {error.message}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 text-white border-white hover:bg-white/10"
                        onClick={startCamera}
                        data-ocid="scanner.secondary_button"
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {/* Viewfinder overlay */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="absolute inset-6 border-2 border-white/60 rounded"
                        style={{
                          boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-2">
                  {isActive ? (
                    <Button
                      onClick={handleCapture}
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
                      data-ocid="scanner.primary_button"
                    >
                      <Camera size={18} className="mr-2" />
                      Capture Document
                    </Button>
                  ) : (
                    <Button
                      onClick={startCamera}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 h-11"
                      data-ocid="scanner.primary_button"
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Camera size={16} className="mr-2" />
                      )}
                      Start Camera
                    </Button>
                  )}
                </div>

                {!isActive && !isLoading && !error && (
                  <p className="text-xs text-slate-400 text-center">
                    Camera will start automatically. Make sure to allow camera
                    access.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* File upload tab */}
          <TabsContent value="upload" className="mt-4">
            {capturedPreview ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-slate-50 border">
                  {isPDF ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <FileText size={48} className="text-blue-500 mb-2" />
                      <p className="text-sm text-slate-600 font-medium">
                        {capturedFile?.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {capturedFile
                          ? `${(capturedFile.size / 1024).toFixed(1)} KB`
                          : ""}
                      </p>
                    </div>
                  ) : (
                    <img
                      src={capturedPreview}
                      alt="Uploaded document"
                      className="w-full object-contain max-h-64"
                    />
                  )}
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0">
                    Ready
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1"
                    data-ocid="scanner.secondary_button"
                  >
                    <X size={14} className="mr-1.5" />
                    Change File
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-ocid="scanner.confirm_button"
                  >
                    Use This File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="scanner.dropzone"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <ImageIcon
                        size={22}
                        className="text-slate-400 group-hover:text-blue-500"
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      Click to select file
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports PDF, JPG, PNG, GIF
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedTypes}
                  className="hidden"
                  onChange={handleFileChange}
                  data-ocid="scanner.upload_button"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-ocid="scanner.close_button"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
