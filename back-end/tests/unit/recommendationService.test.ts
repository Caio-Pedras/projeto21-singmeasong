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
