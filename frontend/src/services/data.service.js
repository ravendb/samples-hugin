import { httpService } from "./http.service";


export async function getCommunities() {
  try {
    return await httpService.get("communities");
  } catch (err) {
    alert(err.response.data.error);
    throw err;
  }
}

export async function queryQuestions(args) {
  try {
    return await httpService.get("search", args);
  } catch (err) {
    alert(err.response.data.error);
    throw err;
  }
}

export async function getQuestion(id) {
  try {
    return await httpService.get("question", { id });
  } catch (err) {
    alert(err.response.data.error);
    throw err;
  }
}
