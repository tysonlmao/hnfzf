import { useState, useEffect } from "react";

// Hook to detect mobile viewport
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;

      // Check for mobile viewport width and touch capability
      const isMobileWidth = width <= 768;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );

      // For development/testing purposes, also show on desktop if viewport is narrow
      const isDevelopment = process.env.NODE_ENV === "development";
      const showForTesting = isDevelopment && isMobileWidth;

      setIsMobile(
        (isMobileWidth && (isTouchDevice || isMobileUserAgent)) ||
          showForTesting
      );
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};
