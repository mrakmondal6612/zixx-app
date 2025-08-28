import React from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useNavigation, useLocation } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { useGlobalLoading } from "@/hooks/GlobalLoading";

// A subtle, non-blocking global loader that appears during navigations or background fetches
export default function GlobalLoadingOverlay() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const navigation = useNavigation();
  const location = useLocation();
  const { active: fetchActive } = useGlobalLoading();

  const inFlight =
    isFetching > 0 ||
    isMutating > 0 ||
    fetchActive > 0 ||
    navigation.state === "loading" ||
    navigation.state === "submitting";

  // Debounce to avoid flicker on very fast requests
  const [visible, setVisible] = React.useState(false);
  const showTimer = React.useRef<number | null>(null);
  const hideTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (inFlight) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      if (!visible && !showTimer.current) {
        showTimer.current = window.setTimeout(() => {
          setVisible(true);
          showTimer.current = null;
        }, 100);
      }
    } else {
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      if (visible && !hideTimer.current) {
        hideTimer.current = window.setTimeout(() => {
          setVisible(false);
          hideTimer.current = null;
        }, 200);
      }
    }
    return () => {
      if (showTimer.current) window.clearTimeout(showTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      showTimer.current = null;
      hideTimer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inFlight, location.pathname]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Top progress bar */}
      <div className="absolute left-0 right-0 top-0 h-0.5 overflow-hidden">
        <div className="h-full w-1/3 animate-[progress_1.1s_infinite_linear] rounded-r bg-primary/90 drop-shadow-md" />
      </div>

      {/* Corner spinner (non-blocking) */}
      <div className="absolute bottom-4 right-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 shadow-sm">
          <Loader size="sm" />
          <span className="text-xs text-muted-foreground">Loading…</span>
        </div>
      </div>
    </div>
  );
}
