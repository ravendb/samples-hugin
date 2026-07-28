import Axios from "axios";
import { httpService } from "./http.service";

const BASE_URL = import.meta.env.PROD
  ? "/api/"
  : "http://localhost:3030/api/";
const axios = Axios.create({ withCredentials: true });

export const getCommunities = () => httpService.get("communities");
export const getQuestion = (id) => httpService.get("question", { id });
export const getBootStatus = async (signal) =>
  (await axios.get(`${BASE_URL}boot-status`, { signal, timeout: 15000 })).data;

export function queryQuestionsProgressive(args, callbacks = {}) {
  const controller = new AbortController();
  const params = { ...args };
  const aiEnabled = Boolean(params.aiEnabled);
  delete params.aiEnabled;

  const run = async () => {
    try {
      const normal = await axios.get(`${BASE_URL}search`, {
        params,
        signal: controller.signal,
      });
      callbacks.onNormal?.(normal.data);
      if (!aiEnabled || controller.signal.aborted) return;
      callbacks.onAiStart?.();
      const ai = await axios.get(`${BASE_URL}search`, {
        params: { ...params, mode: "ai" },
        signal: controller.signal,
      });
      callbacks.onAi?.(ai.data);
    } catch (error) {
      if (controller.signal.aborted || error.response?.status === 409) return;
      callbacks.onError?.(
        error.response?.data?.error || error.message || "Search failed",
      );
    }
  };

  run();
  return { abort: () => controller.abort() };
}
