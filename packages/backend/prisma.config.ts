import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-sqlite/config";
import { defineConfig as composer } from "@prisma/composer/config";
import { nodeBuild } from "@prisma/composer/node/control";
import { prismaCloud, prismaState } from "@prisma/composer-prisma-cloud/control";

process.loadEnvFile?.();

export default definePrismaConfig({
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
  orm: ormConfig({
    contract: "./src/prisma/contract.ts",
    output: "./src/prisma/generated",
    db: {
      connection: process.env.DATABASE_URL ?? "file:./ticketflow.db",
    },
  }),
  composer: composer({
    entry: "./module.ts",
    extensions: [prismaCloud({ region: "us-east-1" }), nodeBuild()],
    state: prismaState(),
  }),
});
