// @ts-nocheck
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const env = require("../config/env.js");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const logger = require("../config/logger.js");
const HttpException = require("../lib/exception.js");
const { RESPONSE_CODE } = require("../types/index.js");

class WatsonXService {
    constructor() {
        this.watsonxAIService = WatsonXAI.newInstance({
            version: '2023-05-29',
            serviceUrl: env.WATSONX_URL,
            // serviceUrl: 'https://us-south.ml.cloud.ibm.com',
            apiKey: env.WATSONX_API_KEY,
        });
    }

    async generateEmbedding(data) {
        if (!data) {
            data = "Hello there.";
        }

        console.log("debug 1");
        
        const chunkText = await this.chunkText(data);
        const result = [];

        for (const chunk of chunkText) {
            const params = {
                input: chunk,
                modelId: 'ibm/granite-13b-chat-v2', // Replace with the actual WatsonX embedding model ID
                projectId: env.WATSONX_PROJECT_ID,
                parameters: {
                    max_new_tokens: 100, // Adjust parameters as needed for embedding
                },
            };

            try {
                const response = await this.watsonxAIService.textEmbedding(params);
                result.push({
                    content: chunk,
                    embedding: response.result.embedding, // Adjust to match the WatsonX API response
                });
            } catch (err) {
                logger.error("Error generating embedding", err);
                throw new HttpException(RESPONSE_CODE.GENERATIVE_AI_ERROR, "Error generating embedding", 400);
            }
        }

        return result;
    }

    async chunkText(data) {
        if (!data) {
            throw new Error("Data is required");
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000, // max characters per chunk
            chunkOverlap: 150, // overlap between chunks
        });

        const tokens = await splitter.splitText(data);
        return tokens;
    }

    async functionCall(props) {
        let resp = {
            error: null,
            data: null,
        };

        try {
            const params = {
                input: props.prompt,
                modelId: 'watsonx-function-calling-model-id', // Replace with the actual WatsonX function calling model ID
                projectId: '<YOUR_PROJECT_ID>',
                parameters: {
                    max_new_tokens: 1000, // Adjust as necessary
                },
            };

            const response = await this.watsonxAIService.functionCall(params);
            resp.data = response.result.functionCalls; // Adjust to match WatsonX API response
            return resp;
        } catch (err) {
            logger.error("Error calling AI function", err);
            resp.error = err;
            throw new HttpException(RESPONSE_CODE.GENERATIVE_AI_ERROR, "Error calling AI function", 400);
        }
    }

    async callAI(props) {
        let resp = {
            data: null,
            error: null,
        };

        try {
            const params = {
                input: props.user_prompt,
                modelId: 'watsonx-model-id', // Replace with the actual WatsonX model ID
                projectId: '<YOUR_PROJECT_ID>',
                parameters: {
                    max_new_tokens: 1000,
                    temperature: 0.7, // Adjust based on requirements
                    top_k: 50,
                },
            };

            if (props?.enable_call_history) {
                params.history = props.history;
                params.systemInstruction = props.instruction;
            }

            const response = await this.watsonxAIService.textGeneration(params);
            resp.data = response.result.results[0].generated_text; // Adjust to match WatsonX API response
            return resp;
        } catch (err) {
            logger.error("GenAI response error", err);
            resp.error = err;
            return resp;
        }
    }

    async similaritySearch() {
        // Implement WatsonX similarity search logic if applicable
    }
}

module.exports = WatsonXService;
