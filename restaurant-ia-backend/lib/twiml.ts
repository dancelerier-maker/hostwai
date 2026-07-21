// Small, dependency-free TwiML builders. Escaping matters here — this text
// came from a caller's speech and from an LLM, never trust it as raw XML.

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const VOICE = "Polly.Lea-Neural"; // French neural voice. Swap per-language if you detect it server-side.

// Note: <Pause> plays silence, not an actual ringback tone — Twilio has
// already "answered" the call by the time our webhook responds, so we can't
// make the caller hear real ringing for free. For a more authentic feel,
// host a ringback .mp3 in /public and swap the <Pause> for a looped <Play>.
export function gatherAndSay(text: string, actionUrl: string, language = "fr-FR", delaySeconds = 0): string {
  const pause = delaySeconds > 0 ? `<Pause length="${Math.round(delaySeconds)}"/>\n  ` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${pause}<Gather input="speech" action="${escapeXml(actionUrl)}" method="POST" speechTimeout="auto" language="${language}">
    <Say voice="${VOICE}" language="${language}">${escapeXml(text)}</Say>
  </Gather>
  <Say voice="${VOICE}" language="${language}">Je n'ai rien entendu, au revoir.</Say>
  <Hangup/>
</Response>`;
}

export function sayAndHangup(text: string, language = "fr-FR"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE}" language="${language}">${escapeXml(text)}</Say>
  <Hangup/>
</Response>`;
}

export function sayAndTransfer(text: string, toNumber: string, language = "fr-FR"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE}" language="${language}">${escapeXml(text)}</Say>
  <Dial>${escapeXml(toNumber)}</Dial>
</Response>`;
}
