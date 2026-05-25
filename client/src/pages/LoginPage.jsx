import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../state/AuthContext.jsx";

function validateLoginForm(form) {
  const email = String(form.email || "").trim();
  const password = String(form.password || "");

  if (!email) {
    return "Email is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  return "";
}

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    preferredLanguage: "en",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateLoginForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(form.email.trim().toLowerCase(), form.password);
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      form={form}
      submitting={submitting}
      error={error}
      message=""
      onChange={(event) =>
        setForm((current) => ({
          ...current,
          [event.target.name]: event.target.value,
        }))
      }
      onSubmit={handleSubmit}
    />
  );
}
