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
      .then((res) => res.json())
      .then((data) => setUsers(data));
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
      <span>Created by</span>
      {users.map((user, i) => (
        <span key={user.id}>
          <span style={{ color: "var(--accent)" }}>{user.name}</span>
          {i < users.length - 1 && <span style={{ margin: "0 .25rem" }}>·</span>}
        </span>
      ))}
    </div>
  );
}