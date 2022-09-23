import supertest from "supertest";
import app from "../../src/app.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import recommendationFactory from "../factories/recommendationFactory.js";

describe("/recomendations", () => {
  beforeEach(async () => {
    await recommendationRepository.resetDataBase();
  });
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

    it;
  });
});
