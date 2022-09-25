import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService.js";
import recommendationFactory from "../factories/recommendationFactory.js";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Insert recommendation in database tests", () => {
  it("Create recommendation", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {});
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});
    const response = await recommendationService.insert(
      recommendationFactory()
    );
    expect(recommendationRepository.findByName).toBeCalled();
    expect(recommendationRepository.create).toBeCalled();
  });
  it("Create a recommendation with not unique name error", async () => {
    const recommendation = recommendationFactory();
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return {
          name: recommendation.name,
          youtubeLink: recommendation.youtubeLink,
        };
      });
    const response = recommendationService.insert({
      name: recommendation.name,
      youtubeLink: recommendation.youtubeLink,
    });
    expect(response).rejects.toEqual({
      type: "conflict",
      message: "Recommendations names must be unique",
    });
  });
});

describe("Post votes on recommendation tests", () => {
  it("Post upvote", async () => {
    const recommendation = { ...recommendationFactory(), id: 1, score: 0 };
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {});
    await recommendationService.upvote(recommendation.id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
  });
  it("Post upvote on a non existing recommendation error", async () => {
    const recommendation = { ...recommendationFactory(), id: 1, score: 0 };
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {});
    const response = recommendationService.upvote(recommendation.id);
    expect(response).rejects.toEqual({
      type: "not_found",
      message: "",
    });
  });
  it("Post downvote", async () => {
    const recommendation = { ...recommendationFactory(), id: 1, score: 0 };
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    await recommendationService.downvote(recommendation.id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
  });
  it("Post downvote witho bellow -5 score", async () => {
    const recommendation = { ...recommendationFactory(), id: 1, score: -5 };
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {
        return { ...recommendation, score: -6 };
      });
    jest
      .spyOn(recommendationRepository, "remove")
      .mockImplementationOnce((): any => {});
    await recommendationService.downvote(1);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).toBeCalled();
  });
  it("Post downvote on a non existing recommendation error", async () => {
    const recommendation = { ...recommendationFactory(), id: 1, score: 0 };
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {});
    const response = recommendationService.downvote(recommendation.id);
    expect(response).rejects.toEqual({
      type: "not_found",
      message: "",
    });
  });
});

describe("Get recommendations tests", () => {
  it("Get all recommendations", async () => {
    const recommendation = recommendationFactory();
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementationOnce((): any => {
        return [recommendation];
      });
    const response = await recommendationService.get();
    expect(recommendationRepository.findAll).toBeCalled();
    expect(response).toEqual([recommendation]);
  });
  it("Return the informed amount of recommendations order by score", async () => {
    let recommendations = [];
    for (let i = 0; i < 3; i++) {
      const recommendation = recommendationFactory();
      recommendations.push({ ...recommendation, id: i + 1, score: i });
    }
    jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockImplementationOnce((): any => {
        return recommendations;
      });
    const response = await recommendationService.getTop(10);
    expect(response).toEqual(recommendations.reverse());
    expect(recommendationRepository.getAmountByScore).toBeCalled();
  });

  it("Get recommendation by Id", async () => {
    const recommendation = { ...recommendationFactory(), id: 1, score: 0 };
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    const response = await recommendationService.getById(recommendation.id);
    expect(response).toEqual(recommendation);
    expect(recommendationRepository.find).toBeCalled();
  });
  it("Get recommendation by id error", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {});
    const response = recommendationService.getById(1);
    expect(response).rejects.toEqual({
      message: "",
      type: "not_found",
    });
  });
});

describe("Get random recommendations", () => {
  it("Get randon recommendation 70% scenario", async () => {
    let recommendations = [];
    for (let i = 0; i < 3; i++) {
      const recommendation = recommendationFactory();
      recommendations.push({ ...recommendation, id: i + 1, score: i * 10 });
    }
    const chance = 0.6;
    jest.spyOn(Math, "random").mockImplementationOnce((): any => {
      return chance;
    });
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementationOnce((): any => {
        return [recommendations[2]];
      });
    const response = await recommendationService.getRandom();
    expect(Math.random).toBeCalled();
    expect(recommendationRepository.findAll).toBeCalledWith({
      score: 10,
      scoreFilter: "gt",
    });
    expect(response.score).toBeGreaterThan(10);
  });

  it("Get randon recommendation 30% scenario", async () => {
    let recommendations = [];
    for (let i = 0; i < 3; i++) {
      const recommendation = recommendationFactory();
      recommendations.push({ ...recommendation, id: i + 1, score: i * 10 });
    }
    const chance = 0.8;
    jest.spyOn(Math, "random").mockImplementationOnce((): any => {
      return chance;
    });
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementationOnce((): any => {
        return [recommendations[0]];
      });
    const response = await recommendationService.getRandom();
    expect(Math.random).toBeCalled();
    expect(recommendationRepository.findAll).toBeCalledWith({
      score: 10,
      scoreFilter: "lte",
    });
    expect(response.score).toBeLessThanOrEqual(10);
  });
  it("Get randon recommendation with empty database", async () => {
    const recommendations = [];
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementation((): any => {
        return recommendations;
      });

    const response = recommendationService.getRandom();
    expect(response).rejects.toEqual({
      type: "not_found",
      message: "",
    });
  });
});
