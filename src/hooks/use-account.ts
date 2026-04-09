"use client";

import { useState, useEffect } from "react";

export function useAccount() {
  const [accountId, setAccountId] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("nexus_account");
    if (stored) setAccountId(stored);
  }, []);

  function handleSetAccount(id: string) {
    setAccountId(id);
    localStorage.setItem("nexus_account", id);
  }

  return { accountId, setAccountId: handleSetAccount };
}
