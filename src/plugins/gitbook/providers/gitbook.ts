import type {
  IAgentRuntime,
  Memory,
  State,
  Provider
} from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { GitBookResponse, GitBookClientConfig } from "../types";

function cleanText(text: string): string {
  return text
      .replace(/<@!?\d+>/g, "")
      .replace(/<#\d+>/g, "")
      .replace(/<@&\d+>/g, "")
      .replace(/(?:^|\s)@[\w_]+/g, "")
      .trim();
}

async function validateQuery(
  runtime: IAgentRuntime,
  text: string
): Promise<boolean> {
  elizaLogger.info(`🔍 Validating query: ${text}`);
  const keywords = {
      generalQueries: [
          "how", "what", "where", "explain", "show", "tell",
          "can", "does", "is", "are", "will", "why",
          "harmony", "one", "blockchain", "crypto"
      ],
  };

  try {
      const gitbookConfig = runtime.character.clientConfig
          ?.gitbook as GitBookClientConfig;

      const projectTerms = gitbookConfig?.keywords?.projectTerms || [];
      const documentTriggers = gitbookConfig?.documentTriggers || [];

      if (gitbookConfig?.keywords?.generalQueries) {
          keywords.generalQueries = [
              ...keywords.generalQueries,
              ...gitbookConfig.keywords.generalQueries,
          ];
      }

      const containsAnyWord = (text: string, words: string[] = []) => {
          return words.length === 0 ||
              words.some((word) => {
                  if (word.includes(" ")) {
                      return text.includes(word.toLowerCase());
                  }
                  const regex = new RegExp(`\\b${word}\\b`, "i");
                  return regex.test(text);
              });
      };

      const hasProjectTerm = containsAnyWord(text, projectTerms);
      const hasDocTrigger = containsAnyWord(text, documentTriggers);
      const hasGeneralQuery = containsAnyWord(text, keywords.generalQueries);

      const isValid = hasProjectTerm || hasDocTrigger || hasGeneralQuery;

      elizaLogger.info(`✅ Query validation result: ${isValid}`);
      return isValid;
  } catch (error) {
      elizaLogger.warn(`❌ Error in GitBook validation:\n${error}`);
      return false;
  }
}

export const gitbookProvider: Provider = {
  get: async (
      runtime: IAgentRuntime,
      message: Memory,
      _state?: State
  ): Promise<string> => {
      elizaLogger.info("🎯 GitBook provider get() called");
      try {
          const spaceId = runtime.getSetting("GITBOOK_SPACE_ID");
          elizaLogger.info(
            `📚 GitBook Space ID check: ${spaceId ? "Present" : "Missing"}`
          );

          if (!spaceId) {
              elizaLogger.error("❌ GitBook Space ID not configured");
              return "";
          }

          const text = message.content.text.toLowerCase().trim();
          const isValidQuery = await validateQuery(runtime, text);
          if (!isValidQuery) {
              return "";
          }

          const cleanedQuery = cleanText(message.content.text);
          const response = await fetch(
              `https://api.gitbook.com/v1/spaces/${spaceId}/search/ask`,
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      query: cleanedQuery,
                      variables: {},
                  }),
              }
          );

          if (!response.ok) {
              throw new Error(`GitBook API error: ${response.status}`);
          }

          const data: GitBookResponse = await response.json();
          elizaLogger.info(`Gitbook data`, data);
          if (data.answer?.text) {
              return `Based on our GitBook documentation: ${data.answer.text}`;
          }

          if (data.answer?.followupQuestions?.length > 0) {
              const followupResult = await fetch(
                  `https://api.gitbook.com/v1/spaces/${spaceId}/search/ask`,
                  {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                          query: data.answer.followupQuestions[0],
                          variables: {},
                      }),
                  }
              );

              if (followupResult.ok) {
                  const followupData: GitBookResponse = await followupResult.json();
                  if (followupData.answer?.text) {
                      return `Based on our GitBook documentation: ${followupData.answer.text}`;
                  }
              }
          }

          return "";
      } catch (error) {
          elizaLogger.error(`❌ Error in GitBook provider: ${error}`);
          return "";
      }
  },
};