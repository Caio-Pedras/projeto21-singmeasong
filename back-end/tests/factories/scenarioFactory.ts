import { prisma } from "../../src/database.js";
import recommendationFactory from "./recommendationFactory.js";
import { CreateRecommendationData } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { Recommendation } from "@prisma/client";

type ScoredRecomendationData = Omit<Recommendation, "id">;
export async function createOneRecomendationScenario() {
  const recommendation = recommendationFactory();
  await createRecommendation(recommendation);
  return recommendation;
}
export async function createOneRecomendationScenarioNegativeScored() {
  const recommendation = recommendationFactory();
  await createScoredRecommendation({
    ...recommendation,
    score: -5,
  });
  return recommendation;
}
export async function createAnyNumberRecommendationScenario(
  NUMBER_OF_RECOMMENDATIONS: number
) {
  const recomendations = [];
  for (let i = 0; i < NUMBER_OF_RECOMMENDATIONS; i++) {
    const recommendation = recommendationFactory();
    recomendations.push(recommendation);
    await createRecommendation(recommendation);
  }
  return recomendations;
}
export async function createAnyNumberScoredRecommendationScenario(
  NUMBER_OF_RECOMMENDATIONS: number
) {
  const recomendations = [];
  for (let i = 0; i < NUMBER_OF_RECOMMENDATIONS; i++) {
    const score = Math.floor(Math.random() * (200 - 10) + 10);
    const recommendation = { ...recommendationFactory(), score };
    recomendations.push(recommendation);
    await createScoredRecommendation(recommendation);
  }
  return recomendations;
}

async function createRecommendation(data: CreateRecommendationData) {
  await recommendationRepository.create(data);
}

async function createScoredRecommendation(data: ScoredRecomendationData) {
  await recommendationRepository.create(data);
}
