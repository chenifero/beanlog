//navegación para móvil se muestra en la parte inferior
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";
import { PiCoffee } from "react-icons/pi";
import { PiCoffeeBeanFill } from "react-icons/pi";
import { FaMap } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaCoffee } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    notificationService
      .getUnreadCount(user.id)
      .then(setUnreadCount)
      .catch(console.error);
  }, [user?.id]);

  const navItems = [
    { path: "/", label: "Home", icon: <FaCoffee /> },
    { path: "/cafes", label: "Cafés", icon: <PiCoffeeBeanFill /> },
    { path: "/map", label: "Mapa", icon: <FaMap /> },
    {
      path: "/notifications",
      label: "Notificaciones",
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
    { path: "/profile", label: "Perfil", icon: <FaUser /> },
  ];


  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
