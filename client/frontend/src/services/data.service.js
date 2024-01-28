import { httpService } from "./http.service";


export async function getCommunities() {
  return await httpService.get("communities");
}

export async function queryQuestions(args) {
  return await httpService.get("search", args);
}

export async function getQuestion(id) {
  return await httpService.get("question", { id });
}
