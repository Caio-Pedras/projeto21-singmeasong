// <reference type ="cypress" />
import recommendationFactory from "../../../back-end/tests/factories/recommendationFactory";
const RECOMMENDATION = recommendationFactory();
const DELETE_DOWNVOTE_NUMBER = 6;
describe("Recommendation tests", () => {
  it("Create a recommendation", () => {
    cy.request("DELETE", "http://localhost:5000/reset");
    cy.visit("http://localhost:3000");
    cy.get("input[placeholder='Name']").type(RECOMMENDATION.name);
    cy.get("input[placeholder='https://youtu.be/...']").type(
      RECOMMENDATION.youtubeLink
    );
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendation"
    );
    cy.get("button").click();
    cy.wait("@createRecommendation");
    cy.contains(RECOMMENDATION.name);
  });
  it("Create a recommendation that already exists", () => {
    cy.get("input[placeholder='Name']").type(RECOMMENDATION.name);
    cy.get("input[placeholder='https://youtu.be/...']").type(
      RECOMMENDATION.youtubeLink
    );
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendation"
    );
    cy.get("button").click();
    cy.wait("@createRecommendation");
    cy.on("windown:alert", (str) => {
      expect(str).to.equal("Error Creating recommendation!");
    });
  });
});

describe("Votes tests", () => {
  it("Post Upvote", () => {
    cy.get(".upArrow").click();
    cy.contains("1");
  });
  it("Post Downvote", () => {
    cy.get(".downArrow").click();
    cy.contains("0");
  });
  it(`Downvote until reach ${DELETE_DOWNVOTE_NUMBER}`, () => {
    for (let i = 0; i < DELETE_DOWNVOTE_NUMBER; i++) {
      cy.get(".downArrow").click();
    }
    cy.contains("No recommendations yet! Create your own :)");
  });
});

describe("Menu buttons tests", () => {
  it("fill tests", () => {
    for (let i = 0; i < 3; i++) {
      const testRecommendation = recommendationFactory();
      cy.get("input[placeholder='Name']").type(testRecommendation.name);
      cy.get("input[placeholder='https://youtu.be/...']").type(
        testRecommendation.youtubeLink
      );
      cy.intercept("POST", "http://localhost:5000/recommendations").as(
        "createRecommendation"
      );
      cy.get("button").click();
      cy.wait("@createRecommendation");
      for (let j = i; j < 3; j++) {
        cy.get(".upArrow").first().click();
      }
    }
  });
  it("tests top button", () => {
    cy.get(".top").click();
    cy.get(".likeBar").first().contains("4");
    cy.url().should("eq", "http://localhost:3000/top");
  });
  it("tests random button", () => {
    cy.get(".random").click();
    cy.get("article").should("have.length", 1);
    cy.url().should("eq", "http://localhost:3000/random");
  });
  it("tests home button", () => {
    cy.get(".home").click();
    cy.url().should("eq", "http://localhost:3000/");
  });
});
after(() => {
  cy.request("DELETE", "http://localhost:5000/reset");
});
