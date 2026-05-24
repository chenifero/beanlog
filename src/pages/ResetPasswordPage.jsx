import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { supabase } from "@/services/supabase";
import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setValidSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!password || password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.updatePassword(password);
      setMessage("✅ Contraseña actualizada");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("❌ " + (err.message || "Error al actualizar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h2 className="reset-title">Nueva contraseña</h2>
        {!validSession ? (
          <p className="reset-hint">Verificando enlace...</p>
        ) : (
          <>
            {message && <p className="reset-message">{message}</p>}
            {error && <p className="reset-error">{error}</p>}
            <div className="reset-field">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="reset-field">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button className="reset-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}