import got from "got";
import type { GatsbyNode } from "gatsby";

type Page = {
  id: string;
  page_id: string;
  pagePath: string;
  ast: any;
  static_assets: Array<string>;
  internal: {
    type: string;
    contentDigest: string;
  };
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type Page implements Node @dontInfer {
      id: String!
      page_id: String!
      pagePath: String!
      ast: JSON!
    }
  `;
  createTypes(typeDefs);
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
  createContentDigest,
  cache,
}) => {
  const { createNode } = actions;
  const lastFetched: number = await cache.get(`lastFetched`);
  console.log({ lastFetched });

  console.log(`hi`);

  lastFetched ? console.log(`fetching only changed pages`) : console.log(`fetching all pages`)
  let response;
  if (!lastFetched) {
    response = await got(`http://localhost:3000/docs`).json();
  } else {
    response = await got(
      `http://localhost:3000/docs/updated/${lastFetched}`
    ).json();
  }

  await cache.set(`lastFetched`, response.timestamp);

  response.pages.forEach((datum) => {
    const { source, ...page }: Page = datum;
    page.id = createNodeId(page.page_id);
    page.pagePath = page.page_id.replace(
      `docs/allison/master/administration/`,
      ``
    );
    page.internal = {
      type: `Page`,
      contentDigest: createContentDigest(page),
    };

    console.log(page);

    createNode(page);
  });
};
