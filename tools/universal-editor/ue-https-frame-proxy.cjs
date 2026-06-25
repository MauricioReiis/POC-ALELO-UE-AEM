const fs = require("fs");
const https = require("https");
const http = require("http");

const LISTEN_PORT = Number(process.env.UE_PROXY_PORT || 9443);
const TARGET_HOST = process.env.UE_TARGET_HOST || "localhost";
const TARGET_PORT = Number(process.env.UE_TARGET_PORT || 4502);
const TARGET_PROTOCOL = process.env.UE_TARGET_PROTOCOL || "http:";

const CERT_PATH = process.env.UE_PROXY_CERT || "tools/certs/localhost.pem";
const KEY_PATH = process.env.UE_PROXY_KEY || "tools/certs/localhost-key.pem";

const AEM_USER = process.env.UE_AEM_USER || "admin";
const AEM_PASS = process.env.UE_AEM_PASS || "admin";
const BASIC_AUTH = Buffer.from(`${AEM_USER}:${AEM_PASS}`).toString("base64");

const cert = fs.readFileSync(CERT_PATH, "utf8");
const key = fs.readFileSync(KEY_PATH, "utf8");

function patchCsp(existingCsp) {
  const frameAncestors = "frame-ancestors 'self' https://experience.adobe.com";
  if (!existingCsp || !existingCsp.trim()) {
    return frameAncestors;
  }

  if (/frame-ancestors\s+/i.test(existingCsp)) {
    return existingCsp.replace(/frame-ancestors\s+[^;]*/i, frameAncestors);
  }

  return `${existingCsp}; ${frameAncestors}`;
}

const server = https.createServer({ cert, key }, (req, res) => {
  const headers = { ...req.headers };

  // Force auth for local POC to avoid third-party cookie/login issues in iframe.
  headers.authorization = `Basic ${BASIC_AUTH}`;
  headers.host = `${TARGET_HOST}:${TARGET_PORT}`;

  const options = {
    protocol: TARGET_PROTOCOL,
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    method: req.method,
    path: req.url,
    headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const outHeaders = { ...proxyRes.headers };

    // Allow rendering inside Experience Cloud iframe.
    delete outHeaders["x-frame-options"];
    delete outHeaders["frame-options"];
    outHeaders["content-security-policy"] = patchCsp(
      outHeaders["content-security-policy"],
    );

    res.writeHead(proxyRes.statusCode || 500, outHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxyReq);
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(
    `UE HTTPS Frame Proxy: https://localhost:${LISTEN_PORT} -> ${TARGET_PROTOCOL}//${TARGET_HOST}:${TARGET_PORT}`,
  );
  console.log(
    "X-Frame-Options stripped, CSP frame-ancestors patched, Basic auth injected.",
  );
});
