import crypto from "crypto";

const secret = "20ae6974-ca78-4840-8852-f35c6da4c6cb";

const payload = JSON.stringify({
  "from": "+251911223344",
  "text": "ሀ"
});

const hmac = crypto.createHmac("sha256", secret);
hmac.update(payload);
const signature = `sha256=${hmac.digest("hex")}`;

console.log("Payload:", payload);
console.log("Signature:", signature);
