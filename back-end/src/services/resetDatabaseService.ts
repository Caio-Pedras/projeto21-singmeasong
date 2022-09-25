import { recommendationRepository } from "../repositories/recommendationRepository.js";

export async function resetDataBase() {
  await recommendationRepository.resetDataBase();
}
