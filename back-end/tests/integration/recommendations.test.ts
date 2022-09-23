import { prisma } from "../../src/database.js";
import supertest from "supertest";
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
  it("Create a recommendation with a invalid link", async () => {
    const recommendation = recommendationFactory();
    const response = await supertest(app)
      .post("/recommendations")
      .send({ ...recommendation, youtubeLink: "invalidLink" });
    expect(response.status).toBe(422);
  });
  it("Create a recommendation with a empty name", async () => {
    const recommendation = recommendationFactory();
    const response = await supertest(app)
      .post("/recommendations")
      .send({ ...recommendation, name: "" });
    expect(response.status).toBe(422);
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
  it("Insert downvote on recommendation until delete (-6 score)", async () => {
    const recommendation = await createOneRecomendationScenario();
    const { id } = await recommendationRepository.findByName(
      recommendation.name
    );
    for (let i = 0; i < 6; i++) {
      const response = await supertest(app).post(
        `/recommendations/${id}/downvote`
      );
    }
    const deletedRecommendation = await recommendationRepository.find(id);
    expect(deletedRecommendation).toBeNull;
  });
  it("Insert upvote on recommendation that dosent exist", async () => {
    const response = await supertest(app).post(`/recommendations/1/upvote`);
    expect(response.status).toBe(404);
  });
  it("Insert downvote on recommendation that dosent exist", async () => {
    const response = await supertest(app).post(`/recommendations/1/downvote`);
    expect(response.status).toBe(404);
  });
});

describe("GET /recomendations", () => {
  it("Get recommendations", async () => {
    const SCENARIO = 10;
    await createAnyNumberRecommendationScenario(SCENARIO * 2);
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
  it("Get recommendation by Id that dosent exist", async () => {
    const response = await supertest(app).get(`/recommendations/${1}`);
    expect(response.status).toBe(404);
  });
  it("get recommendations and order by score", async () => {
    const SCENARIO = 10;
    await createAnyNumberScoredRecommendationScenario(SCENARIO + 2);
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
  it("Get a random recommendation", async () => {
    const SCENARIO = 10;
    await createAnyNumberScoredRecommendationScenario(SCENARIO);
    const response = await supertest(app).get("/recommendations/random");
    expect(response.body.score).not.toBeNull();
    expect(response.status).toBe(200);
  });
  it("Get a random recommendation, but in a scenario without songs", async () => {
    const response = await supertest(app).get("/recommendations/random");
    expect(response.status).toBe(404);
  });
});

afterAll(async () => {
  await recommendationRepository.resetDataBase();
  await prisma.$disconnect();
});
