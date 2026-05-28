// Navegación lateral para escritorio
// Puede estar expandida (220px) o colapsada (60px, solo iconos)

import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Avatar from "@/components/ui/Avatar";
import "./Sidebar.css";
import { PiCoffeeBeanFill } from "react-icons/pi";
import { FaMap } from "react-icons/fa6";
import { IoSettings, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaCoffee, FaBell } from "react-icons/fa";

export default function Sidebar() {
  const { user, profile, unreadCount } = useAuth();
  const { isCollapsed, toggle } = useSidebar();

  const navItems = [
    { path: "/", label: "Home", icon: <FaCoffee /> },
    { path: "/cafes", label: "Mis Cafés", icon: <PiCoffeeBeanFill /> },
    { path: "/map", label: "Mapa", icon: <FaMap /> },
    {
      path: "/notifications",
      label: "Avisos",
      icon: (
        <div style={{ position: "relative", display: "inline-flex" }}>
          <FaBell />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      ),
    },
    { path: "/settings", label: "Ajustes", icon: <IoSettings /> },
  ];

  return (
    // La clase 'collapsed' se añade cuando isCollapsed es true
    // Esto cambia el ancho de 220px a 60px via CSS
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {/* Solo muestra el logo completo cuando está expandida */}
        {!isCollapsed && (
          <img
            src="/logos/logo_header_slogan.png"
            alt="BeanLog"
            className="sidebar-logo-img"
          />
        )}
        {/* Botón que alterna entre expandido y colapsado */}
        <button
          className="sidebar-toggle"
          onClick={toggle}
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? <IoChevronForward /> : <IoChevronBack />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            // Cuando está colapsada, el título del navegador muestra el label al hacer hover
            title={isCollapsed ? item.label : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            {/* El label desaparece cuando está colapsada */}
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-profile">
            <Avatar
              size="md"
              name={profile?.username || user?.email?.split("@")[0]}
              src={profile?.avatar_url}
            />
            {!isCollapsed && (
              <div className="user-info">
                <p className="user-name">{profile?.username || "Usuario"}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
