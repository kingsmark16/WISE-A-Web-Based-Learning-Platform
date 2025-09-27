import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Clock11,
  Film,
  X
} from "lucide-react";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const formatTime = (s = 0) => {
  if (!isFinite(s)) return "0:00";
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default function VideoPlayer({
  open = false,
  onClose = () => {},
  url = "",
  title = "",
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  // responsive helper: treat <= 640px as mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(max-width:640px)");
    const update = () => setIsMobile(!!(mq ? mq.matches : window.innerWidth <= 640));
    update();
    try { mq?.addEventListener?.("change", update); } catch { /* fallback for older browsers */ mq?.addListener?.(update); }
    window.addEventListener("resize", update);
    return () => {
      try { mq?.removeEventListener?.("change", update); } catch { mq?.removeListener?.(update); }
      window.removeEventListener("resize", update);
    };
  }, []);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  // loading/buffering state
  const [buffering, setBuffering] = useState(false);
  // Removed unused scrubbing state

  useEffect(() => {
    if (!open) {
      // reset UI when closed
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setBufferedEnd(0);
      setBuffering(false);
      // pause video if open toggled off
      if (videoRef.current) {
        videoRef.current.pause();
        try {
          videoRef.current.currentTime = 0;
        } catch (err) {
          void err; /* ignore errors when resetting time (e.g. cross-origin / not ready) */
        }
      }
    } else {
      // try to play (if allowed) when opened
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current
            .play()
            .then(() => setPlaying(true))
            .catch(() => {
              /* playback blocked or failed */
              setPlaying(false);
            });
        }
      }, 50);
    }
  }, [open]);

  useEffect(() => {
    // Re-attach listeners when video element or src (url/open) changes so time/progress updates reliably.
    const v = videoRef.current;
    if (!v) return;
    let mounted = true;
    const onTime = () => { if (!mounted) return; setCurrentTime(v.currentTime || 0); };
    const onDuration = () => { if (!mounted) return; setDuration(isFinite(v.duration) ? v.duration : 0); };
    const onLoadedMeta = () => { if (!mounted) return; setDuration(isFinite(v.duration) ? v.duration : 0); };
    const onPlay = () => { if (!mounted) return; setPlaying(true); setBuffering(false); };
    const onPause = () => { if (!mounted) return; setPlaying(false); };
    const onEnded = () => { if (!mounted) return; setPlaying(false); };
    const onProgress = () => {
      if (!mounted) return;
      try {
        const buf = v.buffered;
        if (buf && buf.length) setBufferedEnd(buf.end(buf.length - 1));
      } catch (err) {
        void err;
      }
      // if we have buffered enough, clear buffering flag
      try {
        if (v.buffered && v.buffered.length) {
          const end = v.buffered.end(v.buffered.length - 1);
          if (isFinite(end) && end > v.currentTime + 0.5) setBuffering(false);
        }
      } catch (err) { void err; }
    };

    // buffering handlers
    const onWaiting = () => { if (!mounted) return; setBuffering(true); };
    const onCanPlay = () => { if (!mounted) return; setBuffering(false); };

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("progress", onProgress);

    v.addEventListener("waiting", onWaiting);
    v.addEventListener("stalled", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("playing", onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);

    // initialize values right away (useful if metadata already loaded)
    onTime();
    onProgress();
    onLoadedMeta();

    // initial buffering state based on readyState (< 3 = HAVE_FUTURE_DATA)
    try {
      setBuffering(v.readyState < 3);
    } catch (err) {
      void err;
    }

    return () => {
      mounted = false;
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("progress", onProgress);

      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("stalled", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("playing", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
    };
  }, [url, open]);
  
  // Auto-play when url changes (or player opened) so "Next" starts playing immediately.
  useEffect(() => {
    if (!open || !url) return;
    const v = videoRef.current;
    if (!v) return;
    // small delay allows the <video> element to update src and begin loading
    const t = setTimeout(async () => {
      try {
        await v.play();
        setPlaying(true);
      } catch (err) {
        void err; /* play may be blocked by browser policy */
        setPlaying(false);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [url, open]);
  
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      // Space - toggle play/pause
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      // ArrowLeft / ArrowRight - seek
      if (e.key === "ArrowLeft") {
        seek((currentTime || 0) - 5);
      }
      if (e.key === "ArrowRight") {
        seek((currentTime || 0) + 5);
      }
      // ArrowUp / ArrowDown - volume
      if (e.key === "ArrowUp") {
        changeVolume(clamp(volume + 0.05, 0, 1));
      }
      if (e.key === "ArrowDown") {
        changeVolume(clamp(volume - 0.05, 0, 1));
      }
      if (e.key === "f") toggleFullscreen();
      if (e.key === "m") toggleMute();
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, currentTime, volume]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* playback may be blocked; reflect state */
          setPlaying(false);
        });
    } else {
      v.pause();
      // update immediately so UI responds without waiting for 'pause' event
      setPlaying(false);
    }
  }, []);

  const seek = (time) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    const t = clamp(time, 0, v.duration || 0);
    try {
      v.currentTime = t;
    } catch (err) {
      void err;
    }
    setCurrentTime(t);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) setVolume(v.volume ?? 1);
  };

  const changeVolume = (val) => {
    const v = videoRef.current;
    const newVol = clamp(val, 0, 1);
    setVolume(newVol);
    if (v) {
      v.volume = newVol;
      v.muted = newVol === 0;
      setMuted(v.muted);
    }
  };

  const changePlaybackRate = (rate) => {
    const v = videoRef.current;
    setPlaybackRate(rate);
    if (v) v.playbackRate = rate;
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (err) {
      void err; /* ignore fullscreen errors */
    }
  };

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // progress / scrubbing helpers
  const getProgressClientRect = () => progressRef.current?.getBoundingClientRect();
  const pointerPosToTime = (clientX) => {
    const rect = getProgressClientRect();
    if (!rect || !isFinite(duration) || duration <= 0) return 0;
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
    return pct * duration;
  };

  const onProgressPointerDown = (e) => {
    e.preventDefault();
    // pause while scrubbing but remember state
    const wasPlaying = !videoRef.current?.paused;
    if (videoRef.current && wasPlaying) videoRef.current.pause();
    const time = pointerPosToTime(e.clientX);
    seek(time);
    const move = (ev) => {
      seek(pointerPosToTime(ev.clientX));
    };
    const up = (ev) => {
      seek(pointerPosToTime(ev.clientX));
      // resume if was playing
      try {
        if (videoRef.current && wasPlaying) videoRef.current.play().catch(() => {});
      } catch (err) {
        void err;
      }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // show controls on pointer activity
  useEffect(() => {
    if (!open) return;
    let hideTimer = null;
    const show = () => {
      setShowControls(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowControls(false), 3500);
    };
    const el = containerRef.current;
    el?.addEventListener("pointermove", show);
    el?.addEventListener("pointerdown", show);
    show();
    return () => {
      el?.removeEventListener("pointermove", show);
      el?.removeEventListener("pointerdown", show);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [open]);

  // lock background scroll when player is open (preserve scroll position)
  const scrollYRef = useRef(0);
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;
    // prevent background scroll and keep page visually in place
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";

    return () => {
      // restore
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      window.scrollTo(0, scrollYRef.current);
    };
  }, [open]);
  
  if (!open) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video player"}
      onClick={onBackdropClick}
    >
      <div
        ref={containerRef}
        className="w-full max-w-4xl sm:max-w-2xl lg:max-w-4xl bg-black rounded-md shadow-2xl overflow-hidden relative"
        style={isMobile ? { height: "calc(100vh - 2rem)" } : { aspectRatio: "16/9", maxHeight: "90vh" }}
      >
        <div
          className={`absolute sm:top-2 top-4 left-2 right-2 z-40 flex items-center justify-between gap-2 transition-opacity duration-200 ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* make left area flexible but allow its contents to wrap; keep controls from shrinking */}
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-black/40 px-2 py-2 sm:py-1 rounded text-sm text-white/90">
            <Film className="h-4 w-4 flex-shrink-0" />
            {/* allow the title to wrap to new lines on small screens */}
            <div className="whitespace-normal break-words max-w-full">
              <div className="truncate-none">{title || "Untitled lesson"}</div>
            </div>
          </div>
          
          {/* Keep previous/next hidden on very small screens and ensure Close is always the X icon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              {hasPrevious && (
                <button
                  type="button"
                  title="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious?.();
                  }}
                  className="bg-black/40 p-3 sm:p-1 rounded hover:bg-black/60 text-white/90"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5" />
                </button>
              )}
              {hasNext && (
                <button
                  type="button"
                  title="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext?.();
                  }}
                  className="bg-black/40 p-3 sm:p-1 rounded hover:bg-black/60 text-white/90"
                >
                  <ChevronRight className="h-6 w-6 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>

            <button
              type="button"
              title="Close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close video"
              className="bg-black/40 p-3 sm:p-1 rounded hover:bg-black/60 text-white/90"
            >
              {/* force the explicit X icon so it never becomes a chevron on small screens */}
              <X className="h-6 w-6 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          src={url}
          preload="metadata"
          controls={false}
          playsInline
          onClick={(e) => e.stopPropagation()} /* don't toggle on video click */
        />

        {/* Buffering / loading overlay (under controls) */}
        {buffering && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 bg-black/40 px-4 py-3 rounded">
              <svg className="animate-spin h-12 w-12 text-white/90" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <div className="text-white/90 text-sm">Loading…</div>
            </div>
          </div>
        )}

        <div
          className={`absolute left-0 right-0 bottom-0 z-40 transition-opacity duration-200 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 bg-gradient-to-t from-black/70 to-transparent">
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 relative">
                {/* visible input for accessibility, hidden pointer target behind it */}
                {/* buffered bar (visualizes amount buffered behind the playable progress) */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-2 sm:h-1 bg-white/20 rounded pointer-events-none"
                  style={{ width: duration > 0 ? `${Math.min(100, (bufferedEnd / duration) * 100)}%` : "0%" }}
                />
                <input
                  aria-label="Seek"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step="0.1"
                  value={currentTime || 0}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-2 sm:h-1 bg-muted-foreground/30 accent-primary relative z-10 align-middle"
                />
                {/* clickable track overlay to support click+drag anywhere on track */}
                <div
                  ref={progressRef}
                  role="presentation"
                  onPointerDown={onProgressPointerDown}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 sm:h-6 cursor-pointer z-20"
                />
                {/* buffered display removed */}
              </div>
              <div className="text-xs text-white/90 ml-3 tabular-nums flex items-center h-6">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
 
          <div className="px-3 pb-3 pt-1 bg-black/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                title={playing ? "Pause" : "Play"}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="bg-white/5 p-3 sm:p-2 rounded text-white hover:bg-white/10"
              >
                {playing ? <Pause className="h-5 w-5 sm:h-4 sm:w-4" /> : <Play className="h-5 w-5 sm:h-4 sm:w-4" />}
              </button>

              <button
                type="button"
                title="Skip backward 10s"
                onClick={(e) => {
                  e.stopPropagation();
                  seek((currentTime || 0) - 10);
                }}
                className="bg-white/5 p-3 sm:p-2 rounded text-white hover:bg-white/10"
              >
                <SkipBack className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>

              <button
                type="button"
                title="Skip forward 10s"
                onClick={(e) => {
                  e.stopPropagation();
                  seek((currentTime || 0) + 10);
                }}
                className="bg-white/5 p-3 sm:p-2 rounded text-white hover:bg-white/10"
              >
                <SkipForward className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>

              <div className="flex items-center gap-2 ml-2">
                {!isMobile && (
                  <>
                    <button
                      type="button"
                      title={muted ? "Unmute" : "Mute"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="bg-white/5 p-3 sm:p-2 rounded text-white hover:bg-white/10"
                    >
                      {muted || volume === 0 ? <VolumeX className="h-5 w-5 sm:h-4 sm:w-4" /> : <Volume className="h-5 w-5 sm:h-4 sm:w-4" />}
                    </button>

                    <input
                      aria-label="Volume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-20 sm:w-24 accent-primary"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">

              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-sm text-white/90">
                <div className="relative flex items-center">
                  {/* ensure option background/text are dark and readable when the native dropdown opens */}
                  <style>{`
                    .custom-speed-select { background-color: rgba(255,255,255,0.03); color: #E6EEF8; }
                    .custom-speed-select option { background-color: #071124; color: #E6EEF8; }
                    /* small niceties for some browsers */
                    .custom-speed-select::-ms-expand { color: #E6EEF8; }
                  `}</style>
                   <label htmlFor="speed" className="sr-only">Speed</label>
                   <select
                     id="speed"
                     value={playbackRate}
                     onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                     className="custom-speed-select bg-transparent border text-white text-sm outline-none px-2 py-1 rounded-md appearance-none pr-8"
                     style={{ color: "#E6EEF8", backgroundColor: "rgba(255,255,255,0.03)" }}
                     aria-label="Playback speed"
                   >
                    <option value="0.5" style={{ backgroundColor: "oklch(0.141 0.005 285.823)", color: "#E6EEF8" }}>0.5x</option>
                    <option value="0.75" style={{ backgroundColor: "oklch(0.141 0.005 285.823)", color: "#E6EEF8" }}>0.75x</option>
                    <option value="1" style={{ backgroundColor: "oklch(0.141 0.005 285.823)", color: "#E6EEF8" }}>1x</option>
                    <option value="1.25" style={{ backgroundColor: "oklch(0.141 0.005 285.823)", color: "#E6EEF8" }}>1.25x</option>
                    <option value="1.5" style={{ backgroundColor: "oklch(0.141 0.005 285.823)", color: "#E6EEF8" }}>1.5x</option>
                    <option value="2" style={{ backgroundColor: "oklch(0.141 0.005 285.823)", color: "#E6EEF8" }}>2x</option>
                   </select>
                   {/* decorative chevron - pointer-events-none so clicks go to the select */}
                   <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
                     <path d="M6 7l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
               </div>

              <button
                type="button"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="bg-white/5 p-2 rounded text-white hover:bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}