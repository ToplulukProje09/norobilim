"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  // ✅ Sayfa ilk açıldığında login durumunu kontrol et
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setLoggedIn(data.success);
      } catch {
        setLoggedIn(false);
      }
    };

    checkLogin();
  }, [pathname]);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // ✅ cookie için gerekli
      });

      const data = await res.json();

      if (data.success) {
        setLoggedIn(true);
        setUsername("");
        setPassword("");
      } else {
        setError(data.message || "Giriş başarısız");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu hatası");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // ✅ Cache sorunu yaşamamak için "no-store"
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();
      setLoggedIn(data.success);
    } catch (err) {
      console.error("Logout hata:", err);
      setLoggedIn(false);
    }
  };

  if (!loggedIn) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "5rem",
        }}
      >
        <h2>Admin Girişi</h2>

        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginTop: "1rem", padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: "1rem", padding: "0.5rem" }}
        />

        <button
          onClick={handleLogin}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Giriş Yap
        </button>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </div>
    );
  }

  // ✅ Başarılı giriş sonrası admin menü
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "5rem",
      }}
    >
      <h1>Hoşgeldiniz!</h1>

      <Link href="/adminmainmenu">
        <button style={{ marginTop: "2rem", padding: "0.5rem 1rem" }}>
          Admin Git
        </button>
      </Link>

      <Link href="/adminblogs">
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Admin Bloglara Git
        </button>
      </Link>

      <Link href="/adminpersons">
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Admin Personlara Git
        </button>
      </Link>

      <Link href="/adminevents">
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Admin Events Git
        </button>
      </Link>

      <Link href="/adminpodcast">
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Admin Podcasts Git
        </button>
      </Link>

      <Link href="/adminacademics">
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Admin Akademiye Git
        </button>
      </Link>

      <Link href="/adminyasaklar">
        <button
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 5,
          }}
        >
          Yasak Kelimeler Yönetimi
        </button>
      </Link>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "2rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#555",
          color: "#fff",
          border: "none",
          borderRadius: 5,
        }}
      >
        Çıkış Yap
      </button>
    </div>
  );
};

export default Page;
