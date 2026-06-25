const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultRangoRoot =
  "C:/Users/Mauros/Documents/PROJETOS/AEM/projetos/front-end/modules/frontend/alelo/libs/@rango";
const rangoRoot = process.env.RANGO_LIB_PATH || defaultRangoRoot;

const vendorDir = path.join(
  repoRoot,
  "apps/src/main/content/jcr_root/apps/alelo/clientlibs/clientlib-base/css/vendor",
);

const coreCssSrc = path.join(rangoRoot, "core/dist/assets/index.css");
const coreFontsDirSrc = path.join(rangoRoot, "core/dist/fonts");
const tokensDirSrc = path.join(rangoRoot, "tokens/dist/css/global-tokens");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function assertExists(fileOrDir) {
  if (!fs.existsSync(fileOrDir)) {
    throw new Error(`Path not found: ${fileOrDir}`);
  }
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  assertExists(coreCssSrc);
  assertExists(coreFontsDirSrc);
  assertExists(tokensDirSrc);

  ensureDir(vendorDir);
  const fontsDest = path.join(vendorDir, "fonts");
  const tokensDest = path.join(vendorDir, "tokens");

  fs.copyFileSync(coreCssSrc, path.join(vendorDir, "rango-core.css"));
  copyDir(coreFontsDirSrc, fontsDest);
  copyDir(tokensDirSrc, tokensDest);

  fs.writeFileSync(
    path.join(vendorDir, "rango-fonts.css"),
    '@import "./fonts/fonts.css";\n',
    "utf8",
  );

  fs.writeFileSync(
    path.join(vendorDir, "rango-global-tokens.css"),
    '@import "./tokens/index.css";\n',
    "utf8",
  );

  console.log("Rango design system synced successfully.");
  console.log(`Source: ${rangoRoot}`);
  console.log(`Target: ${vendorDir}`);
}

main();
