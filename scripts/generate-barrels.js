#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */

/**
 * Barrel file generator script
 * Generates index.ts files with export * from statements for each component folder
 */

const fs = require("fs");
const path = require("path");

const DIRECTORIES = [
  "src/components/ui",
  "src/components/expense",
  "src/components/layout",
  "src/components/settings",
  "src/components/statistics",
  "src/components/transactions",
];

const HEADER = `/**
 * @file Barrel exports - Auto-generated
 */

`;

function generateBarrel(directory) {
  const fullPath = path.join(process.cwd(), directory);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${directory} - directory not found`);
    return;
  }

  const files = fs
    .readdirSync(fullPath)
    .filter(
      (file) =>
        (file.endsWith(".tsx") || file.endsWith(".ts")) &&
        file !== "index.ts" &&
        !file.includes(".test.") &&
        !file.includes(".spec.") &&
        !file.includes(".stories.")
    )
    .sort();

  if (files.length === 0) {
    console.log(`Skipping ${directory} - no exportable files`);
    return;
  }

  const exports = files
    .map((file) => {
      const name = file.replace(/\.(tsx?|ts)$/, "");
      return `export * from "./${name}";`;
    })
    .join("\n");

  const content = HEADER + exports + "\n";
  const indexPath = path.join(fullPath, "index.ts");

  fs.writeFileSync(indexPath, content);
  console.log(`Generated ${directory}/index.ts (${files.length} exports)`);
}

console.log("Generating barrel files...\n");
DIRECTORIES.forEach(generateBarrel);
console.log("\nDone!");
