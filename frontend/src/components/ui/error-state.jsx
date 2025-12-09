import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Home,
  ChevronDown,
  ChevronUp,
  WifiOff,
  ServerCrash,
  ShieldAlert,
  FileQuestion
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * ErrorState - A modern, responsive error display component
 * 
 * @param {Object} props
 * @param {string} props.title - Main error title
 * @param {string} props.message - Detailed error message
 * @param {string} props.variant - 'fullPage' | 'card' | 'inline' | 'compact'
 * @param {string} props.type - 'error' | 'notFound' | 'network' | 'server' | 'auth'
 * @param {function} props.onRetry - Retry callback function
 * @param {boolean} props.showBack - Show back button
 * @param {boolean} props.showHome - Show home button
 * @param {string} props.homeRoute - Custom home route
 * @param {string} props.className - Additional classes
 */
const ErrorState = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  variant = "card",
  type = "error",
  onRetry,
  showBack = false,
  showHome = false,
  homeRoute = "/",
  className,
  children,
}) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      window.location.reload();
    }
  };

  // Icon based on error type
  const getIcon = () => {
    const iconClass = "w-6 h-6 sm:w-8 sm:h-8";
    switch (type) {
      case "notFound":
        return <FileQuestion className={iconClass} />;
      case "network":
        return <WifiOff className={iconClass} />;
      case "server":
        return <ServerCrash className={iconClass} />;
      case "auth":
        return <ShieldAlert className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  // Color scheme based on type
  const getColorScheme = () => {
    switch (type) {
      case "notFound":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          text: "text-amber-800",
          textMuted: "text-amber-600",
        };
      case "network":
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          iconBg: "bg-slate-100",
          iconColor: "text-slate-600",
          text: "text-slate-800",
          textMuted: "text-slate-600",
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          text: "text-red-800",
          textMuted: "text-red-600",
        };
    }
  };

  const colors = getColorScheme();

  // Compact inline variant
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border",
          colors.bg,
          colors.border,
          className
        )}
      >
        <div className={cn("flex-shrink-0", colors.iconColor)}>
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className={cn("text-sm font-medium", colors.text)}>{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className={cn("ml-auto h-7 px-2", colors.textMuted, "hover:bg-transparent")}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRetrying && "animate-spin")} />
          </Button>
        )}
      </div>
    );
  }

  // Inline variant for in-page errors
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "rounded-xl border p-4 sm:p-5",
          colors.bg,
          colors.border,
          className
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn("p-2 rounded-lg flex-shrink-0", colors.iconBg, colors.iconColor)}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-sm sm:text-base", colors.text)}>
              {title}
            </h3>
            <p className={cn("text-xs sm:text-sm mt-1", colors.textMuted)}>
              {message}
            </p>
            {children && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium transition-colors",
                    colors.textMuted,
                    "hover:opacity-80"
                  )}
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show details
                    </>
                  )}
                </button>
                {showDetails && (
                  <div className="mt-2 p-2 rounded bg-white/50 text-xs font-mono overflow-auto max-h-32">
                    {children}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {(onRetry || showBack) && (
          <div className="flex flex-wrap gap-2 mt-4 ml-11 sm:ml-14">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRetrying && "animate-spin")} />
                {isRetrying ? "Retrying..." : "Try Again"}
              </Button>
            )}
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go Back
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Card variant
  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-2xl border overflow-hidden",
          colors.bg,
          colors.border,
          className
        )}
      >
        {/* Decorative top bar */}
        <div className={cn("h-1", type === "notFound" ? "bg-amber-400" : type === "network" ? "bg-slate-400" : "bg-red-400")} />
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center">
            {/* Animated icon container */}
            <div className="relative mb-4">
              <div className={cn(
                "absolute inset-0 rounded-full blur-xl opacity-30",
                type === "notFound" ? "bg-amber-400" : type === "network" ? "bg-slate-400" : "bg-red-400"
              )} />
              <div className={cn(
                "relative p-3 sm:p-4 rounded-full",
                colors.iconBg,
                colors.iconColor
              )}>
                {getIcon()}
              </div>
            </div>

            <h3 className={cn("font-bold text-base sm:text-lg", colors.text)}>
              {title}
            </h3>
            <p className={cn("text-xs sm:text-sm mt-1.5 max-w-sm", colors.textMuted)}>
              {message}
            </p>

            {children && (
              <div className="mt-3 w-full">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={cn(
                    "flex items-center justify-center gap-1 text-xs font-medium transition-colors mx-auto",
                    colors.textMuted,
                    "hover:opacity-80"
                  )}
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show details
                    </>
                  )}
                </button>
                {showDetails && (
                  <div className="mt-2 p-3 rounded-lg bg-white/50 text-xs font-mono text-left overflow-auto max-h-32">
                    {children}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {showBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="h-9 gap-1.5 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              )}
              {onRetry && (
                <Button
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="h-9 gap-1.5 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                >
                  <RefreshCw className={cn("w-4 h-4", isRetrying && "animate-spin")} />
                  {isRetrying ? "Retrying..." : "Try Again"}
                </Button>
              )}
              {showHome && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(homeRoute)}
                  className="h-9 gap-1.5 text-sm"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full page variant
  return (
    <div className={cn(
      "min-h-[60vh] flex items-center justify-center px-4 py-8",
      className
    )}>
      <div className="max-w-md w-full">
        {/* Background decorations */}
        <div className="relative">
          <div className={cn(
            "absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20",
            type === "notFound" ? "bg-amber-400" : type === "network" ? "bg-slate-400" : "bg-red-400"
          )} />
          <div className={cn(
            "absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20",
            type === "notFound" ? "bg-amber-400" : type === "network" ? "bg-slate-400" : "bg-red-400"
          )} />
        </div>

        {/* Card content */}
        <div className={cn(
          "relative rounded-3xl border shadow-xl overflow-hidden backdrop-blur-sm",
          "bg-white/80",
          colors.border
        )}>
          {/* Top gradient bar */}
          <div className={cn(
            "h-1.5 bg-gradient-to-r",
            type === "notFound" 
              ? "from-amber-400 via-orange-400 to-amber-400" 
              : type === "network" 
              ? "from-slate-400 via-gray-400 to-slate-400"
              : "from-red-400 via-rose-400 to-red-400"
          )} />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Animated icon */}
              <div className="relative mb-5">
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-xl opacity-40 animate-pulse",
                  type === "notFound" ? "bg-amber-400" : type === "network" ? "bg-slate-400" : "bg-red-400"
                )} />
                <div className={cn(
                  "relative p-4 sm:p-5 rounded-2xl",
                  colors.iconBg,
                  colors.iconColor
                )}>
                  {getIcon()}
                </div>
              </div>

              <h2 className={cn("font-bold text-xl sm:text-2xl", colors.text)}>
                {title}
              </h2>
              <p className={cn("text-sm sm:text-base mt-2 max-w-xs", colors.textMuted)}>
                {message}
              </p>

              {/* Error details expandable */}
              {children && (
                <div className="mt-4 w-full">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 text-sm font-medium transition-all mx-auto",
                      colors.textMuted,
                      "hover:opacity-80"
                    )}
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide technical details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show technical details
                      </>
                    )}
                  </button>
                  {showDetails && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-100 text-xs font-mono text-left text-slate-700 overflow-auto max-h-40">
                      {children}
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto">
                {showBack && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="h-11 gap-2 text-sm px-5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </Button>
                )}
                {onRetry && (
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className={cn(
                      "h-11 gap-2 text-sm px-5",
                      type === "notFound" 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        : type === "network"
                        ? "bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700"
                        : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600",
                      "text-white"
                    )}
                  >
                    <RefreshCw className={cn("w-4 h-4", isRetrying && "animate-spin")} />
                    {isRetrying ? "Retrying..." : "Try Again"}
                  </Button>
                )}
                {showHome && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(homeRoute)}
                    className="h-11 gap-2 text-sm px-5"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ErrorState };
