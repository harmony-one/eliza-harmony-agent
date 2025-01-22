import type { Plugin } from "@elizaos/core";
import { gitbookProvider } from "./providers/gitbook.ts";

export const gitbookPlugin: Plugin = {
    name: "GitBook Documentation",
    description: "Plugin for querying Harmony ONE GitBook documentation",
    actions: [],
    providers: [gitbookProvider],
    evaluators: [],
};

export default gitbookPlugin;
export * from "./types.ts";