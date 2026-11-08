import path from "node:path";
import sqlite from "@prisma/orm-sqlite/runtime";
import { contractFromJson } from "@prisma/orm-sqlite/static";

import "temporal-polyfill/global";

import type { Contract } from "./generated/contract.d.ts";
import contractJson from "./generated/contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

function resolveDatabasePath(rawUrl?: string): string {
  if (!rawUrl) {
    return path.resolve(import.meta.dir, "../../ticketflow.db");
  }
  const cleanUrl = rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl;
  return path.isAbsolute(cleanUrl) ? cleanUrl : path.resolve(import.meta.dir, "../../", cleanUrl);
}

export const db = sqlite({
  contract,
  path: resolveDatabasePath(process.env.DATABASE_URL),
});
