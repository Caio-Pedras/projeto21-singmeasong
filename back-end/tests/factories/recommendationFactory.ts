import { faker } from "@faker-js/faker";

export default function recommendationFactory() {
  return {
    name: faker.lorem.words(2),
    youtubeLink: "https://www.youtube.com/watch?v=tfSS1e3kYeo",
  };
}
