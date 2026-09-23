"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: false });
    // Hard navigation: força reload completo e limpa o cache do SessionProvider
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
    >
      Sair
    </button>
  );
}
