import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { Avatar } from "../components/Avatar.jsx";

export function ProfilePage() {
  const { publicId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get(`/users/public/${publicId}`);
        setProfile(response.user);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [publicId]);

  return (
    <div className="min-h-screen bg-converso-night text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-16">
        <div className="glass-card w-full p-8 md:p-10 text-center">
          {loading ? (
            <p className="text-sm text-converso-subtext">Loading profile…</p>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-sm text-rose-200">{error}</p>
              <Link
                className="text-converso-cyan transition hover:text-white"
                to="/login"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-6 flex justify-center">
                <Avatar user={profile} size="xxl" className="!rounded-3xl shadow-glow" />
              </div>
              <h1 className="text-3xl font-semibold text-white">
                @{profile.username}
              </h1>
              <p className="mt-2 text-sm text-converso-subtext">
                Converso public profile
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-converso-subtext">
                    Public ID
                  </p>
                  <p className="mt-2 break-all text-lg font-semibold text-white">
                    {profile.publicId}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-converso-subtext">
                    Language
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {profile.preferredLanguage.toUpperCase()}
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-converso-subtext">
                Use this page to connect, invite, or join this user in a
                multilingual chat.
              </p>
              <Link
                className="mt-6 inline-flex rounded-2xl bg-converso-gradient px-6 py-3 text-sm font-semibold text-white transition hover:shadow-glow"
                to="/login"
              >
                Continue to Converso
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
