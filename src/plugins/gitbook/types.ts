import type { Provider } from "@elizaos/core";

export interface GitBookResponse {
    answer?: {
        text: string;
        followupQuestions: string[];
    };
    error?: string;
}

export interface GitBookKeywords {
    projectTerms?: string[];
    generalQueries?: string[];
}

export interface GitBookClientConfig {
    keywords?: GitBookKeywords;
    documentTriggers?: string[];
}