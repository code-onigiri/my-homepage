const encoder = new TextEncoder();

function base64UrlEncode(input) {
  let bytes = input;
  if (typeof input === "string") {
    bytes = encoder.encode(input);
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeToString(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (input.length % 4)) % 4);
  const binary = atob(base64);
  let output = "";
  for (let i = 0; i < binary.length; i += 1) {
    output += String.fromCharCode(binary.charCodeAt(i));
  }
  return output;
}

async function signState(payload, secret) {
  const payloadJson = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadJson);
  if (!secret) {
    return `${encodedPayload}.unsigned`;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encodedPayload));
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${encodedPayload}.${encodedSignature}`;
}

async function verifyState(state, secret) {
  const [encodedPayload, encodedSignature] = state.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }
  if (!secret || encodedSignature === "unsigned") {
    return JSON.parse(base64UrlDecodeToString(encodedPayload));
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)),
    encoder.encode(encodedPayload)
  );
  if (!valid) {
    return null;
  }
  return JSON.parse(base64UrlDecodeToString(encodedPayload));
}

function buildAuthRedirectUrl({ baseUrl, clientId, scope, state }) {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${baseUrl}/callback`);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "true");
  return url;
}

function renderAuthResponse({ message, targetOrigin }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Decap CMS OAuth</title>
  </head>
  <body>
    <script>
      (function () {
        var msg = ${JSON.stringify(message)};
        var target = ${JSON.stringify(targetOrigin || "*")};
        if (window.opener && window.opener.postMessage) {
          window.opener.postMessage(msg, target);
        }
        window.close();
      })();
    </script>
  </body>
</html>`;
}

async function handleAuth(requestUrl, env) {
  const provider = requestUrl.searchParams.get("provider") || "github";
  if (provider !== "github") {
    return new Response("Unsupported provider", { status: 400 });
  }
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
  }
  const baseUrl = requestUrl.origin;
  const origin = requestUrl.searchParams.get("origin") || "";
  const scope = requestUrl.searchParams.get("scope") || "repo";
  const state = await signState({ origin, ts: Date.now() }, env.OAUTH_STATE_SECRET);
  const redirectUrl = buildAuthRedirectUrl({ baseUrl, clientId, scope, state });
  return Response.redirect(redirectUrl.toString(), 302);
}

async function handleCallback(requestUrl, env) {
  const error = requestUrl.searchParams.get("error");
  if (error) {
    const message = `authorization:github:${JSON.stringify({ error })}`;
    const html = renderAuthResponse({ message, targetOrigin: "*" });
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const code = requestUrl.searchParams.get("code");
  const stateParam = requestUrl.searchParams.get("state") || "";
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!code || !clientId || !clientSecret) {
    return new Response("Missing OAuth parameters", { status: 400 });
  }
  const statePayload = await verifyState(stateParam, env.OAUTH_STATE_SECRET);
  if (!statePayload) {
    return new Response("Invalid state", { status: 400 });
  }
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${requestUrl.origin}/callback`,
    }),
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    const message = `authorization:github:${JSON.stringify({ error: "token_error" })}`;
    const html = renderAuthResponse({ message, targetOrigin: statePayload.origin || "*" });
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const message = `authorization:github:${JSON.stringify({ token: tokenData.access_token })}`;
  const html = renderAuthResponse({ message, targetOrigin: statePayload.origin || "*" });
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/" || pathname === "") {
      return new Response("Decap CMS OAuth Worker", { status: 200 });
    }
    if (pathname === "/auth") {
      return handleAuth(url, env);
    }
    if (pathname === "/callback") {
      return handleCallback(url, env);
    }
    return new Response("Not Found", { status: 404 });
  },
};
