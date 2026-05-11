// src/components/CreatedBy.tsx
"use client";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
};

export default function CreatedBy() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then(async (res) => {
        if (!res.ok) return [];

        const data: unknown = await res.json();
        return Array.isArray(data) ? data : [];
      })
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div style={{ 
      fontSize: ".8rem", 
      color: "var(--dim)", 
      display: "flex", 
      gap: ".5rem",
      alignItems: "center",
      flexWrap: "wrap"
    }}>
      <span>Created by Enrico, Marvin und Elias</span>
      {users.map((user, i) => (
        <span key={user.id}>
          <span style={{ color: "var(--accent)" }}>{user.name}</span>
          {i < users.length - 1 && <span style={{ margin: "0 .25rem" }}>·</span>}
        </span>
      ))}
    </div>
  );
}
