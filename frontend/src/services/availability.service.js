import { httpService } from "./http.service";

let cached = null;
let inflight = null;

export async function isInternetAvailable() {
  if (cached && Date.now() - cached.at < 10000) return cached.online;
  if (!inflight) {
    inflight = httpService.get("is-online")
      .then((result) => Boolean(result.online))
      .catch(() => false)
      .then((online) => {
        cached = { online, at: Date.now() };
        inflight = null;
        return online;
      });
  }
  return inflight;
}
