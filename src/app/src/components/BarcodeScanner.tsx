import { useState, useEffect, useCallback } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Camera, AlertTriangle, Keyboard } from "lucide-react";
import { cn } from "../lib/utils";

// Type definitions for legacy browser support and barcode scanner
interface LegacyNavigator extends Navigator {
  getUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: DOMException) => void
  ) => void;
  webkitGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: DOMException) => void
  ) => void;
  mozGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: DOMException) => void
  ) => void;
}

interface ScanResult {
  text?: string;
  getText?: () => string;
}

interface BarcodeScannerProps {
  onScanComplete: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const BarcodeScannerComponent = ({
  onScanComplete,
  onClose,
  isOpen,
}: BarcodeScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopStream, setStopStream] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [testingCamera, setTestingCamera] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  useEffect(() => {
    // Check if getUserMedia is supported - be more permissive for mobile
    const checkSupport = () => {
      // Basic API availability check
      const hasGetUserMedia = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      const nav = navigator as LegacyNavigator;
      const hasWebcam = !!(
        nav.getUserMedia ||
        nav.webkitGetUserMedia ||
        nav.mozGetUserMedia
      );

      // On mobile devices, assume support if basic APIs exist
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      return hasGetUserMedia || hasWebcam || isMobileDevice;
    };

    setIsSupported(checkSupport());
  }, []);

  const handleError = useCallback((error: string | DOMException) => {
    console.error("Barcode scanner error:", error);
    console.error("Error details:", {
      name: typeof error === "string" ? error : error.name,
      message: typeof error === "object" ? error.message : error,
    });

    const errorName = typeof error === "string" ? error : error.name;
    const errorMessage =
      typeof error === "object" && "message" in error ? error.message : "";

    if (errorName === "NotAllowedError") {
      setError(
        "Camera permission denied. Please allow camera access to scan barcodes."
      );
    } else if (errorName === "NotFoundError") {
      setError("No camera found on this device.");
    } else if (errorName === "NotReadableError") {
      setError(
        "Camera is being used by another application. Please close other camera apps and try again."
      );
    } else if (errorName === "OverconstrainedError") {
      setError(
        "Camera doesn't support the requested settings. Trying alternative approach..."
      );
      // Try with basic constraints
      setTimeout(() => {
        setError(null);
        setTestingCamera(false);
        setScanning(true);
      }, 1000);
    } else if (errorName === "AbortError") {
      setError("Camera access was interrupted. Please try again.");
    } else {
      setError(
        `Camera error: ${errorName}${
          errorMessage ? ` - ${errorMessage}` : ""
        }. Please try manual entry or check browser settings.`
      );
    }
  }, []);

  // Test camera access when scanner opens
  const testCameraAccess = useCallback(async () => {
    setTestingCamera(true);

    const constraints = [
      // Try rear camera first (best for barcode scanning)
      { video: { facingMode: "environment" } },
      // Fall back to any available camera
      { video: { facingMode: "user" } },
      // Fall back to basic video
      { video: true },
      // Last resort - any video device
      { video: {} },
    ];

    for (let i = 0; i < constraints.length; i++) {
      try {
        console.log(`Trying camera constraint ${i + 1}:`, constraints[i]);
        const stream = await navigator.mediaDevices.getUserMedia(
          constraints[i]
        );
        console.log("Camera access successful!");

        // Stop the test stream immediately
        stream.getTracks().forEach((track) => track.stop());
        setScanning(true);
        setError(null);
        setTestingCamera(false);
        return; // Success, exit the function
      } catch (err) {
        console.log(`Camera constraint ${i + 1} failed:`, err);

        // If this is the last constraint, handle the error
        if (i === constraints.length - 1) {
          setTestingCamera(false);
          handleError(err as string | DOMException);
          return;
        }
        // Otherwise, continue to next constraint
      }
    }
  }, [handleError]);

  useEffect(() => {
    if (isOpen) {
      if (!isSupported) {
        setError(
          "Camera scanning is not supported in this browser. Please try on a mobile device with a modern browser or use manual entry."
        );
        setScanning(false);
      } else {
        // Show permission prompt instead of automatically trying to access camera
        setShowPermissionPrompt(true);
        setError(null);
        setStopStream(false);
      }
    }
  }, [isOpen, isSupported]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScanResult = (err: unknown, result?: any) => {
    if (result) {
      // Try to get text from the result object using multiple approaches
      let scannedText = "";
      if (typeof result.getText === "function") {
        scannedText = result.getText();
      } else if (result.text) {
        scannedText = result.text;
      }

      if (scannedText) {
        onScanComplete(scannedText);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    // Stop the video stream before closing to prevent browser freeze
    setStopStream(true);
    setTimeout(() => {
      setScanning(false);
      setShowManualInput(false);
      setManualBarcode("");
      setTestingCamera(false);
      setShowPermissionPrompt(false);
      setError(null);
      onClose();
    }, 100);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScanComplete(manualBarcode.trim());
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan Barcode
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Scanner Error</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setError(null);
                    testCameraAccess();
                  }}
                  variant="default"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Try Camera Again
                </Button>
                <Button
                  onClick={() => setShowManualInput(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Enter Barcode Manually
                </Button>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full"
                >
                  Close Scanner
                </Button>
              </div>
            </div>
          ) : showPermissionPrompt ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Camera Access Required</p>
                <p className="text-xs text-muted-foreground">
                  Tap "Allow Camera" to scan barcodes with your device's camera.
                  Your browser will ask for permission.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowPermissionPrompt(false);
                    testCameraAccess();
                  }}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Allow Camera Access
                </Button>
                <Button
                  onClick={() => {
                    setShowPermissionPrompt(false);
                    setShowManualInput(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Enter Barcode Manually
                </Button>
              </div>
            </div>
          ) : testingCamera ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Requesting Camera Access</p>
                <p className="text-xs text-muted-foreground">
                  Your browser should show a permission dialog. Please allow
                  camera access to scan barcodes.
                </p>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-muted-foreground mt-2">
                  If no dialog appears, try the manual entry option below.
                </p>
              </div>
              <Button
                onClick={() => setShowManualInput(true)}
                variant="outline"
                size="sm"
              >
                <Keyboard className="w-3 h-3 mr-1" />
                Use manual entry instead
              </Button>
            </div>
          ) : scanning ? (
            <div className="space-y-4">
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <BarcodeScanner
                  width="100%"
                  height="100%"
                  onUpdate={handleScanResult}
                  onError={handleError}
                  facingMode="environment"
                  stopStream={stopStream}
                  delay={300}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  Position barcode within the frame
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure the barcode is well-lit and clearly visible
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={testCameraAccess}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    Request Camera
                  </Button>
                  <Button
                    onClick={() => setShowManualInput(true)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Keyboard className="w-3 h-3 mr-1" />
                    Manual Entry
                  </Button>
                </div>
              </div>
            </div>
          ) : showManualInput ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Keyboard className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Enter Barcode Manually</p>
                <p className="text-xs text-muted-foreground">
                  Type or paste the barcode number below
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Enter barcode number..."
                  className="text-center"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleManualSubmit();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowManualInput(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Scanner
                  </Button>
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualBarcode.trim()}
                    className="flex-1"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Initializing camera...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
