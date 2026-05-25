import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../state/AuthContext.jsx";

function validateRegisterForm(form) {
  const username = String(form.username || "").trim();
  const email = String(form.email || "").trim();
  const password = String(form.password || "");

  if (username.length < 3 || username.length > 30) {
    return "Username must be between 3 and 30 characters.";
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return "Username can only include letters, numbers, dots, underscores, and hyphens.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Password must include uppercase, lowercase, a number, and a special character.";
  }

  if (!form.acceptedTerms) {
    return "You must accept the Terms of Service and Privacy Policy.";
  }

  return "";
}

export function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    preferredLanguage: "en",
    acceptedTerms: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateRegisterForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await register({
        ...form,
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
      });
      setMessage(response.message || "Account created. Check your email for a verification link.");
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      mode="register"
      form={form}
      submitting={submitting}
      error={error}
      message={message}
      onChange={(event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
          ...current,
          [name]: type === "checkbox" ? checked : value,
        }));
      }}
      onSubmit={handleSubmit}
    />
  );
}
