import sqlite from "@prisma/orm-sqlite/runtime";
import { contractFromJson } from "@prisma/orm-sqlite/static";

import "temporal-polyfill/global";

import type { Contract } from "./generated/contract.d.ts";
import contractJson from "./generated/contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

function resolveDatabasePath(rawUrl?: string): string {
  if (!rawUrl) return "./ticketflow.db";
  return rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl;
}

export const db = sqlite({
  contract,
  path: resolveDatabasePath(process.env.DATABASE_URL),
});
