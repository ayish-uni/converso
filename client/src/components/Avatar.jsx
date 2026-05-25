import { SOCKET_URL } from "../config";

export function Avatar({ user, size = "md", className = "" }) {
  const initials = String(user?.username || "CV")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    xs: "h-8 w-8 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
    xxl: "h-32 w-32 text-4xl",
  };

  const url = user?.avatarUrl;
  const fullUrl = url 
    ? (url.startsWith("http") ? url : `${SOCKET_URL}${url.startsWith("/") ? "" : "/"}${url}`)
    : null;

  return (
    <div 
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-converso-gradient font-semibold text-white shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {fullUrl ? (
        <img
          src={fullUrl}
          alt={user?.username}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
            e.target.parentElement.textContent = initials;
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
