// <reference type ="cypress" />
const RECOMMENDATION = {
  name: "Mock song",
  link: "https://www.youtube.com/watch?v=Dst9gZkq1a8",
};
const DELETE_DOWNVOTE_NUMBER = 6;
describe("Recommendation tests", () => {
  it("Create a recommendation", () => {
    cy.request("DELETE", "http://localhost:5000/reset");
    cy.visit("http://localhost:3000");
    cy.get("input[placeholder='Name']").type(RECOMMENDATION.name);
    cy.get("input[placeholder='https://youtu.be/...']").type(
      RECOMMENDATION.link
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
      RECOMMENDATION.link
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
