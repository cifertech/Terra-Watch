import { useState } from "react";

export function ShareView() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyUrl() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setStatus("copied");
    } catch {
      setStatus("failed");
    } finally {
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <button
      className="pointer-events-auto w-full rounded-lg border border-mission-line bg-mission-panel/90 px-4 py-3 text-xs text-mission-text shadow-panel backdrop-blur-xl transition hover:border-mission-accent lg:w-auto"
      type="button"
      onClick={() => void copyUrl()}
    >
      {status === "copied" ? "Copied link" : status === "failed" ? "Copy failed" : "Share this view"}
    </button>
  );
}
