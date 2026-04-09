"use client";

import { useState } from "react";

export function useAccount() {
  const [accountId, setAccountId] = useState("all");
  return { accountId, setAccountId };
}
