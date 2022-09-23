import supertest from "supertest";
import { resourceLimits } from "worker_threads";
import app from "../../src/app.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import recommendationFactory from "../factories/recommendationFactory.js";
import {
  createAnyNumberRecommendationScenario,
  createAnyNumberScoredRecommendationScenario,
  createOneRecomendationScenario,
} from "../factories/scenarioFactory.js";
beforeEach(async () => {
  await recommendationRepository.resetDataBase();
});
describe("POST /recomendations", () => {
  it("Create a recommendation", async () => {
    const recommendation = recommendationFactory();
    const response = await supertest(app)
      .post("/recommendations")
      .send(recommendation);
    expect(response.status).toBe(201);

    const newRecommendation = await recommendationRepository.findByName(
      recommendation.name
    );
    expect(newRecommendation).not.toBeNull();
  });
});

describe("POST /recomendations/:id/upvote||downvote", () => {
  it("Insert upvote on recommendation", async () => {
    const recommendation = await createOneRecomendationScenario();
    const { id } = await recommendationRepository.findByName(
      recommendation.name
    );
    const response = await supertest(app).post(`/recommendations/${id}/upvote`);
    expect(response.status).toBe(200);

    const { score } = await recommendationRepository.find(id);
    expect(score).toBe(1);
  });
  it("Insert downvote on recommendation", async () => {
    const recommendation = await createOneRecomendationScenario();
    const { id } = await recommendationRepository.findByName(
      recommendation.name
    );
    const response = await supertest(app).post(
      `/recommendations/${id}/downvote`
    );
    expect(response.status).toBe(200);

    const { score } = await recommendationRepository.find(id);
    expect(score).toBe(-1);
  });
});

describe("GET /recomendations", () => {
  it("Get all recommendations", async () => {
    const SCENARIO = 10;
    await createAnyNumberRecommendationScenario(SCENARIO);
    const response = await supertest(app).get("/recommendations");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(SCENARIO);
  });
  it("Get recommendation by Id", async () => {
    const recommendation = await createOneRecomendationScenario();
    const { id } = await recommendationRepository.findByName(
      recommendation.name
    );
    const response = await supertest(app).get(`/recommendations/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
  });
  it("get recommendations and order by score", async () => {
    const SCENARIO = 10;
    await createAnyNumberScoredRecommendationScenario(SCENARIO);
    const response = await supertest(app).get(
      `/recommendations/top/${SCENARIO}`
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(SCENARIO);
    for (let i = 0; i < SCENARIO - 1; i++) {
      expect(response.body[i].score).toBeGreaterThanOrEqual(
        response.body[i + 1].score
      );
    }
  });
});
