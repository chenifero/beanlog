// Página de ajustes conectada a Supabase
// Carga el perfil al entrar y guarda los cambios en la base de datos

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";
import { IoSettings } from "react-icons/io5";
import "./SettingsPage.css";
import { FaUser, FaLock, FaCoffee, FaPalette, FaKey } from "react-icons/fa";

const SECTIONS = [
  { id: "profile", label: "Perfil", icon: <FaUser /> },
  { id: "privacy", label: "Privacidad", icon: <FaLock /> },
  { id: "coffee", label: "Preferencias de café", icon: <FaCoffee /> },
  { id: "appearance", label: "Apariencia", icon: <FaPalette /> },
  { id: "account", label: "Cuenta", icon: <FaKey /> },
];

const METHODS = [
  "Espresso",
  "V60",
  "Aeropress",
  "Chemex",
  "Moka",
  "Cold Brew",
  "French Press",
];

const METHOD_ICONS = {
  Espresso: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 110 135"
    >
      <path
        fillRule="evenodd"
        d="M21.67 35h-2.08a6.25 6.25 0 0 1-6.25-6.25v-4.17a6.25 6.25 0 0 1 6.25-6.25h70.83a6.25 6.25 0 0 1 6.25 6.25v4.17A6.25 6.25 0 0 1 90.42 35h-2.08v50h2.08a6.25 6.25 0 0 1 6.25 6.25v4.17a6.25 6.25 0 0 1-6.25 6.25H19.59a6.25 6.25 0 0 1-6.25-6.25v-4.17A6.25 6.25 0 0 1 19.59 85h2.08Zm14.58 0H25.83v50h58.33V35H73.75v2.08a6.25 6.25 0 0 1-6.25 6.25h-25a6.24 6.24 0 0 1-6.25-6.25z"
      />
      <path
        fillRule="evenodd"
        d="M44.58 41.25a2.09 2.09 0 0 1 4.17 0v6.25a2.09 2.09 0 0 1-4.17 0Zm16.67 0a2.08 2.08 0 0 1 4.16 0v6.25a2.08 2.08 0 0 1-4.16 0Zm6.25 16.67v29.17a2.08 2.08 0 0 1-2.08 2.08H44.59a2.09 2.09 0 0 1-2.09-2.08V57.92a2.09 2.09 0 0 1 2.09-2.08h20.83a2.08 2.08 0 0 1 2.08 2.08"
      />
      <path
        fillRule="evenodd"
        d="M75.83 64.17v12.5a2.08 2.08 0 0 1-2.08 2.08h-8.33a2.08 2.08 0 0 1-2.08-2.08v-12.5a2.08 2.08 0 0 1 2.08-2.08h8.33a2.08 2.08 0 0 1 2.08 2.08m-4.17 2.08H67.5v8.33h4.16Z"
      />
    </svg>
  ),
  V60: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 100 125"
    >
      <path d="M85.72 84.52 70.21 52.14a3.92 3.92 0 0 0-3.52-2.22H33.31a3.9 3.9 0 0 0-3.52 2.22L14.28 84.52a14.1 14.1 0 0 0-1.39 6.12v.21A14.16 14.16 0 0 0 27 105h46a14.16 14.16 0 0 0 14.11-14.15v-.21a14.1 14.1 0 0 0-1.39-6.12m-10.33 6.33A2.43 2.43 0 0 1 73 93.28H27a2.43 2.43 0 0 1-2.43-2.43v-.22a2.4 2.4 0 0 1 .24-1L33 72.6a2 2 0 0 1 1.87-1.11c15.22.86 16.3 7.73 33.54 7.73H69a2 2 0 0 1 1.76 1.11l4.43 9.25a2.4 2.4 0 0 1 .24 1.06v.21Zm-12.86-54.6 3-5.86h8.78a8.88 8.88 0 0 0 8.93-8.64 8.79 8.79 0 0 0-8.79-8.94L76 9.64a3.4 3.4 0 0 0 .35-1.12A3.16 3.16 0 0 0 73.21 5H26.87a3.22 3.22 0 0 0-3.12 2.3A3.15 3.15 0 0 0 24 9.58l13.5 26.67H19.73a3.91 3.91 0 0 0-3.91 3.91 3.91 3.91 0 0 0 3.91 3.9h60.54a3.91 3.91 0 0 0 3.91-3.9 3.91 3.91 0 0 0-3.91-3.91Zm8.9-17.58h3a2.93 2.93 0 1 1 0 5.86h-6Z" />
    </svg>
  ),
  Aeropress: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 110 135"
    >
      <path d="M72.67 59.23a1.53 1.53 0 0 0-.46-1.1 1.57 1.57 0 0 0-1.1-.46h-4.58v-26H38.86v26H34.3a1.56 1.56 0 0 0-1.57 1.56v1.46h39.94Zm-18.4-7.67a1.57 1.57 0 0 1-3.13 0v-3a1.57 1.57 0 0 1 3.13 0Zm0-9.2a1.57 1.57 0 0 1-3.13 0v-6.14a1.57 1.57 0 0 1 3.13 0Zm14.43-13.8 3-3.12H54.27v3h14.06ZM51.14 16.25H34.3a1.56 1.56 0 0 0-1.57 1.56v4.58h18.41Zm21.53 1.56a1.57 1.57 0 0 0-1.56-1.56H54.27v6.14h18.4ZM37.08 28.52h14.06v-3H33.66l3 3.12a1.3 1.3 0 0 1 .38-.12Zm37.09 35.29H31.22a4.69 4.69 0 1 0 0 9.25h1.56v22.88a7.82 7.82 0 0 0 7.81 7.81h24.27a7.82 7.82 0 0 0 7.81-7.81V73.06h1.57a4.69 4.69 0 0 0-.07-9.25m-11.81 29c-2.53 4.11-7.94 6.83-12.25 4.1a6.66 6.66 0 0 1-2.67-3.38A11.64 11.64 0 0 1 43 89.41c-6.22-9.6 4-19.41 12.53-10.22 7.95-1.66 11 7.86 6.83 13.62" />
      <path d="M60.66 84.44a4.5 4.5 0 0 0-1 .89c-.63 1.69-.88 3.59-2.74 5.09s-3.48 2.52-3.87 4.42c4.43.8 8.48-4.59 8-8.73a6 6 0 0 0-.42-1.67Zm-2.38-2.13c-5.11-1.31-10 6.35-7.81 10.35.72-2 2.76-3.33 4.47-4.69 1.86-1.72 1-4 3.34-5.66m-5.89-1.78A5.88 5.88 0 0 0 47.11 79a4.85 4.85 0 0 1 1.45 1.67c.36.75.53 1.77.91 2.58a11.5 11.5 0 0 1 2.92-2.69Zm-7.66.47a7.46 7.46 0 0 0 .94 6.77c1.83 3 1.08 0 2-1.57a12.9 12.9 0 0 1-2-4.36 5 5 0 0 0-1-.84Zm31.07-4.92v3.12h1.45a3 3 0 0 1 3 3.13v9.2a3 3 0 0 1-3 3H75.8v1.38a10.4 10.4 0 0 1-.14 1.67h1.56a6.26 6.26 0 0 0 6.16-6.16v-9.2c0-4.2-3.61-6.63-7.58-6.17Z" />
    </svg>
  ),
  Moka: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 32 40"
    >
      <path d="M23.24 27.58a2 2 0 0 1-2 2.42H9.72a2 2 0 0 1-2-2 1.7 1.7 0 0 1 0-.39l1.76-7.83a1.4 1.4 0 0 1 .12-.28h11.76a1.4 1.4 0 0 1 .12.28ZM24.5 7h-2.76L16.5 4.38V3a1 1 0 0 0-2 0v1.38L9.15 7.06 5.26 8a1 1 0 0 0-.73 1.21 1 1 0 0 0 .19.39l4.59 5.74.2 1.74a.86.86 0 0 0 .13.39h11.72a.86.86 0 0 0 .13-.39L22.4 9h2.1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1 1 1 0 0 0 0 2 3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3" />
    </svg>
  ),
  "Cold Brew": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 64 80"
    >
      <path d="M44 5V3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v6h12Zm3 10h-.1a4.09 4.09 0 0 1-3.8-2.7l-.4-1.3h-9.3l-.4 1.3a4 4 0 0 1-3.8 2.7H29a8 8 0 0 0-8 8v10h4v-4a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H31.9l-.9 6.1V61a4.55 4.55 0 0 1-.5 2H47a8 8 0 0 0 8-8V23a8 8 0 0 0-8-8M13 63h14a2 2 0 0 0 2-2H11a2 2 0 0 0 2 2" />
      <path d="M13.3 39.7a8.4 8.4 0 0 0 2.7-.4 13.63 13.63 0 0 1 8 0 8.4 8.4 0 0 0 2.7.4 10 10 0 0 0 1.7-.2L31 39v-4H9v4l2.6.5a11 11 0 0 0 1.7.2M31 41.4V41l-2.2.5a11 11 0 0 1-5.4-.3 11 11 0 0 0-6.7 0 9.9 9.9 0 0 1-5.4.3L9 41v.4a57 57 0 0 0 .5 7.1L11 59h18l1.5-10.5a55 55 0 0 0 .5-7.1M17 49h-4v-4h4Zm3 6.8L17.2 53l2.8-2.8 2.8 2.8Zm4-6L21.2 47l2.8-2.8 2.8 2.8ZM36.9 40l.3-.9a4.72 4.72 0 0 1 3-3l1.2-.4a2.86 2.86 0 0 0 1.7-1.7l.1-.5c-2.2-1.3-6-.2-8.9 2.8a17 17 0 0 0-1.3 1.5v4.8a4.55 4.55 0 0 1 1.9-.8 3 3 0 0 0 2-1.8m4.8 3.7c2.7-2.7 3.8-6.1 3-8.4a4.72 4.72 0 0 1-2.7 2.3l-1.2.4a2.86 2.86 0 0 0-1.7 1.7l-.3.9a4.88 4.88 0 0 1-3.6 3.2 3 3 0 0 0-1.9 1.4l-.6 1.2c2.3 1.3 6.1.2 9-2.7" />
    </svg>
  ),
  "French Press": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 110 135"
    >
      <path
        fillRule="evenodd"
        d="M75.8 39.14H57.08v39.61h12.4s3.46 0 3.5 2.08-3.43 2.09-3.43 2.09h-29.1s-3.45 0-3.45-2.09 3.5-2.08 3.5-2.08h12.4V39.14H23.75a2.09 2.09 0 0 0-1.67 3.33l12.05 16.18V97.5a2.09 2.09 0 0 0 0 4.17h41.7a2.09 2.09 0 1 0 0-4.17V78.75h6.25a6.25 6.25 0 0 0 6.25-6.25V45.42a6.25 6.25 0 0 0-6.25-6.25H75.8Zm0 35.44V43.33h6.25a2.1 2.1 0 0 1 2.09 2.09V72.5a2.09 2.09 0 0 1-2.09 2.08ZM52.92 35v-8.3h-5.26a13.47 13.47 0 0 0-9.54 3.93A13.15 13.15 0 0 0 35.2 35Zm4.16 0h17.73a13.47 13.47 0 0 0-12.47-8.3h-5.26Zm-4.15-12.51v4.18h4.16v-4.18h6.24a2.08 2.08 0 1 0 0-4.16H46.61a2.08 2.08 0 1 0 0 4.16Z"
      />
    </svg>
  ),
  Chemex: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 100 125"
    >
      <path
        fillRule="evenodd"
        d="M30.4 90h33.5c7.3 0 11.5-5.7 9.4-12.7l-8.8-28.1a.64.64 0 0 1 .6-.8h4.8a1 1 0 0 0 .9-1.3L69 41.7a.46.46 0 0 1 .7-.5l6.5 4.8a1 1 0 0 0 1.5-.3l2.2-3.8a1 1 0 0 0-.5-1.4l-7.8-3.4c-.4-.2-.4-.7 0-.8l7.8-3.4a1 1 0 0 0 .5-1.4l-2.2-3.8a1 1 0 0 0-1.5-.3l-7 5.2a.48.48 0 0 1-.7-.5l1.5-5.9a.94.94 0 0 0-.9-1.2h-4.8a.64.64 0 0 1-.6-.8l2.9-11.9a1.84 1.84 0 0 0-1.8-2.3H29.5a1.84 1.84 0 0 0-1.8 2.3l2.9 11.9a.64.64 0 0 1-.6.8h-4.8a.94.94 0 0 0-.9 1.2l2.4 9.7a1.7 1.7 0 0 1 0 1L23.5 47a1 1 0 0 0 .9 1.3h4.8a.64.64 0 0 1 .6.8L21 77.3c-2.2 7 2 12.7 9.4 12.7M58 19l-1.1 4.6a1.92 1.92 0 0 1-1.8 1.4h-16a1.83 1.83 0 0 1-1.8-1.4L36.2 19a1.84 1.84 0 0 1 1.8-2.3h18.2A1.84 1.84 0 0 1 58 19M38.4 48.3h17.4a1.92 1.92 0 0 1 1.8 1.3c.6 1.9 1.8 5.6 2.6 8.3a1.86 1.86 0 0 1-2.1 2.4 18.76 18.76 0 0 0-10.9 1.1 19 19 0 0 1-12.4.7 1.83 1.83 0 0 1-1.2-2.4l3.2-10.1a1.62 1.62 0 0 1 1.6-1.3"
      />
    </svg>
  ),
};
const ORIGINS = [
  "Etiopía",
  "Colombia",
  "Guatemala",
  "Kenya",
  "Brasil",
  "Costa Rica",
  "Perú",
  "Honduras",
  "Indonesia",
  "Panamá",
];
const LEVELS = ["Casual", "Home Brewer", "Barista"];
const LEVEL_CLASS = {
  Casual: "level-casual",
  "Home Brewer": "level-brewer",
  Barista: "level-barista",
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { user, profile, refreshProfile } = useAuth();

  // Campos del perfil
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [customGender, setCustomGender] = useState("");

  // Privacidad
  const [isPublic, setIsPublic] = useState(true);
  const [defaultPublicTastings, setDefaultPublicTastings] = useState(true);
  const [allowMentions, setAllowMentions] = useState(true);

  // Preferencias de café
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("");

  // Apariencia

  // Autocomplete de ubicación con Photon
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  // Carga el perfil del usuario al entrar en la página
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const profile = await profileService.getProfile(user.id);
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setGender(profile.gender || "");
        setIsPublic(profile.is_public ?? true);
        setDefaultPublicTastings(profile.default_public_tastings ?? true);
        setAllowMentions(profile.allow_mentions ?? true);
        setSelectedMethods(profile.preferred_methods || []);
        setSelectedOrigins(profile.preferred_origins || []);
        setExperienceLevel(profile.experience_level || "");
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  // Busca sugerencias de ciudad en Photon con debounce de 300ms
  useEffect(() => {
    if (location.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=5`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const suggestions = (data.features || []).map((f) => {
          const p = f.properties;
          const parts = [
            p.name,
            p.city !== p.name ? p.city : null,
            p.country,
          ].filter(Boolean);
          return parts.join(", ");
        });
        setLocationSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (err) {
        console.error("[Photon] Error al buscar sugerencias:", err);
        setLocationSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [location]);

  // Alterna la selección de un chip — si está seleccionado lo quita, si no lo añade
  const toggleChip = (value, selected, setSelected) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // Muestra un mensaje de éxito o error durante 3 segundos
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // Sube la foto al storage de Supabase y actualiza el perfil
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await profileService.uploadAvatar(user.id, file);
      await profileService.updateProfile(user.id, { avatar_url: url });
      await refreshProfile(user.id);
      showMessage("✅ Foto actualizada correctamente");
    } catch (err) {
      showMessage("❌ Error al subir la foto");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, {
        username,
        bio,
        location,
        gender: gender === "personalizado" ? customGender : gender,
      });
      // Refresca el perfil en el contexto para que la sidebar se actualice
      await refreshProfile(user.id);
      showMessage("✅ Perfil actualizado correctamente");
    } catch (err) {
      showMessage("❌ Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, {
        is_public: isPublic,
        default_public_tastings: defaultPublicTastings,
        allow_mentions: allowMentions,
      });
      showMessage("✅ Privacidad actualizada correctamente");
    } catch (err) {
      showMessage("❌ Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCoffee = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, {
        preferred_methods: selectedMethods,
        preferred_origins: selectedOrigins,
        experience_level: experienceLevel,
      });
      showMessage("✅ Preferencias guardadas correctamente");
    } catch (err) {
      showMessage("❌ Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    navigate("/login");
  };

  if (loading) return <div className="settings-loading">Cargando...</div>;

  return (
    <div className="settings-page">
      <button
        className="settings-back-btn"
        onClick={() => navigate("/profile")}
      >
        <IoSettings size={26} />
      </button>

      <aside className="settings-menu">
        <h2 className="settings-title">Ajustes</h2>
        <nav className="settings-nav">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? "active" : ""}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="settings-nav-icon">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="settings-content">
        {/* Mensaje de feedback — aparece 3 segundos tras guardar */}
        {message && <div className="settings-message">{message}</div>}

        {activeSection === "profile" && (
          <section className="settings-section">
            <h3 className="settings-section-title">Perfil</h3>
            <div className="settings-avatar-row">
              <input //abre el selector de archivos para cambiar la foto de perfil
                type="file"
                id="avatar-input"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div
                className="settings-avatar"
                onClick={() => document.getElementById("avatar-input").click()}
                style={{ cursor: "pointer" }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  user?.email?.charAt(0).toUpperCase()
                )}
              </div>
              <button
                className="settings-btn-secondary"
                onClick={() => document.getElementById("avatar-input").click()}
              >
                Cambiar foto
              </button>
            </div>
            <div className="settings-field">
              <label>Nombre de usuario</label>
              <input
                type="text"
                placeholder="@usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label>Bio</label>
              <textarea
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label>Ubicación</label>
              <div className="location-autocomplete">
                <input
                  type="text"
                  placeholder="Madrid, España"
                  value={location}
                  autoComplete="off"
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <ul className="location-suggestions">
                    {locationSuggestions.map((label, i) => (
                      <li
                        key={i}
                        className="location-suggestion-item"
                        onMouseDown={() => {
                          setLocation(label);
                          setShowSuggestions(false);
                          setLocationSuggestions([]);
                        }}
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="settings-field">
              <label>Sexo</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Prefiero no decirlo</option>
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
                <option value="personalizado">Personalizado</option>
              </select>
              {gender === "personalizado" && (
                <input
                  type="text"
                  placeholder="Escribe cómo quieres identificarte"
                  value={customGender}
                  onChange={(e) => setCustomGender(e.target.value)}
                  style={{ marginTop: "8px" }}
                />
              )}
            </div>
            <button
              className="settings-btn-primary"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </section>
        )}

        {activeSection === "privacy" && (
          <section className="settings-section">
            <h3 className="settings-section-title">Privacidad</h3>
            <div className="settings-toggle-row">
              <div>
                <p className="settings-toggle-label">Cuenta pública</p>
                <p className="settings-toggle-desc">
                  Cualquier usuario puede ver tus posts y catas
                </p>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <div className="settings-toggle-row">
              <div>
                <p className="settings-toggle-label">
                  Catas públicas por defecto
                </p>
                <p className="settings-toggle-desc">
                  Al publicar una cata será visible para todos
                </p>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={defaultPublicTastings}
                  onChange={(e) => setDefaultPublicTastings(e.target.checked)}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <div className="settings-toggle-row">
              <div>
                <p className="settings-toggle-label">Permitir menciones</p>
                <p className="settings-toggle-desc">
                  Otros usuarios pueden mencionarte en sus posts
                </p>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={allowMentions}
                  onChange={(e) => setAllowMentions(e.target.checked)}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <button
              className="settings-btn-primary"
              onClick={handleSavePrivacy}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </section>
        )}

        {activeSection === "coffee" && (
          <section className="settings-section">
            <h3 className="settings-section-title">Preferencias de café</h3>
            <div className="settings-field">
              <label>Métodos de preparación favoritos</label>
              <div className="settings-chips">
                {METHODS.map((method) => (
                  <button
                    key={method}
                    className={`settings-chip method-chip ${selectedMethods.includes(method) ? "active" : ""}`}
                    onClick={() =>
                      toggleChip(method, selectedMethods, setSelectedMethods)
                    }
                  >
                    <span className="method-chip-name">{method}</span>
                    {METHOD_ICONS[method] && (
                      <span className="method-chip-icon">
                        {METHOD_ICONS[method]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-field">
              <label>Orígenes preferidos</label>
              <div className="settings-chips">
                {ORIGINS.map((origin) => (
                  <button
                    key={origin}
                    className={`settings-chip ${selectedOrigins.includes(origin) ? "active" : ""}`}
                    onClick={() =>
                      toggleChip(origin, selectedOrigins, setSelectedOrigins)
                    }
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-field">
              <label>Nivel de experiencia</label>
              <div className="settings-chips">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    className={`settings-chip ${LEVEL_CLASS[level]} ${experienceLevel === level ? "active" : ""}`}
                    onClick={() => setExperienceLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="settings-btn-primary"
              onClick={handleSaveCoffee}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </section>
        )}

        {activeSection === "appearance" && (
          <section className="settings-section">
            <h3 className="settings-section-title">Apariencia</h3>
            <div className="settings-field">
              <label>Idioma</label>
              <select>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>
        )}

        {activeSection === "account" && (
          <section className="settings-section">
            <h3 className="settings-section-title">Cuenta</h3>
            <div className="settings-field">
              <label>Email actual</label>
              <input type="email" defaultValue={user?.email} disabled />
            </div>
            <div className="settings-field">
              <label>Nuevo email</label>
              <input type="email" placeholder="nuevo@email.com" />
            </div>
            <div className="settings-field">
              <label>Nueva contraseña</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="settings-btn-primary">Guardar cambios</button>

            <div className="settings-divider" />

            <button className="settings-btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <button className="settings-btn-danger">Eliminar cuenta</button>
          </section>
        )}
      </div>
    </div>
  );
}
