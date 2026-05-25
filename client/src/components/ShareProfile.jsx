import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, QrCode, Share2, X } from "lucide-react";
import { Avatar } from "./Avatar.jsx";

function initialsFrom(username) {
  return String(username || "CV")
    .slice(0, 2)
    .toUpperCase();
}

export function ShareProfile({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const profileUrl = useMemo(
    () => `${window.location.origin}/profile/${user.publicId}`,
    [user.publicId],
  );

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(profileUrl, {
      margin: 1,
      width: 320,
      color: {
        dark: "#E7EDF8",
        light: "#00000000",
      },
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrCode(dataUrl);
        }
      })
      .catch((error) => {
        console.error("Failed to generate QR code:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [profileUrl]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  async function handleShare() {
    if (!navigator.share) {
      handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: `Join @${user.username} on Converso`,
        text: `Add @${user.username} on Converso and start chatting.`,
        url: profileUrl,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }

  function handleDownloadQr() {
    if (!qrCode) {
      return;
    }

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${user.username}-converso-qr.png`;
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#0d1220]/90 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.12),transparent_28%)]" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Close share profile dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <div className="mb-6 flex items-center gap-4">
            <Avatar user={user} size="xl" className="!rounded-3xl shadow-glow" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                Share Profile
              </p>
              <h3 className="truncate text-2xl font-semibold text-white">
                @{user.username}
              </h3>
              <p className="truncate text-sm text-white/55">
                Public ID: {user.publicId}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="mx-auto mb-4 flex w-full max-w-[260px] items-center justify-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.95))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt={`QR code for ${user.username}'s profile`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-[228px] w-[228px] flex-col items-center justify-center gap-3 text-white/45">
                  <QrCode className="h-10 w-10" />
                  <span className="text-sm">Generating QR code...</span>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-white/60">
              Scan this code to open @{user.username}'s Converso profile.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/55">
              <span className="block truncate">{profileUrl}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy Link"}
            </button>

            <button
              onClick={handleDownloadQr}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Save QR
            </button>
          </div>

          <button
            onClick={handleShare}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-converso-gradient px-4 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <Share2 className="h-4 w-4" />
            Share with Friends
          </button>
        </div>
      </div>
    </div>
  );
}
