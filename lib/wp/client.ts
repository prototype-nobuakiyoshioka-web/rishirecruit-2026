import { GraphQLClient } from "graphql-request";

const WP_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ?? "http://rishirecruit-2026.local/graphql";

export const wpClient = new GraphQLClient(WP_GRAPHQL_URL);
