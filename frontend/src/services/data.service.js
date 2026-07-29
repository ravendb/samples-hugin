import Axios from "axios";
import { httpService } from "./http.service";

const BASE_URL = import.meta.env.PROD
  ? "/api/"
  : "http://localhost:3030/api/";

export function createDataService(client, baseUrl = BASE_URL) {
  const getBootStatus = async (signal) =>
    (await client.get(`${baseUrl}boot-status`, {
      signal,
      timeout: 15000,
    })).data;

  function queryQuestionsProgressive(args, callbacks = {}) {
    const controller = new AbortController();
    const params = { ...args };
    const aiEnabled = Boolean(params.aiEnabled);
    delete params.aiEnabled;

    const run = async () => {
      try {
        const normal = await client.get(`${baseUrl}search`, {
          params,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        callbacks.onNormal?.(normal.data);
        if (!aiEnabled) return;
        callbacks.onAiStart?.();
        const ai = await client.get(`${baseUrl}search`, {
          params: { ...params, mode: "ai" },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) callbacks.onAi?.(ai.data);
      } catch (error) {
        if (controller.signal.aborted || error.response?.status === 409) return;
        callbacks.onError?.(
          error.response?.data?.error || error.message || "Search failed",
        );
      }
    };

    run();
    return { abort: () => controller.abort(), signal: controller.signal };
  }

  return { getBootStatus, queryQuestionsProgressive };
}

const client = Axios.create({ withCredentials: true });
const dataService = createDataService(client);

export const getCommunities = () => httpService.get("communities");
export const getQuestion = (id) => httpService.get("question", { id });
export const getBootStatus = dataService.getBootStatus;
export const queryQuestionsProgressive = dataService.queryQuestionsProgressive;
