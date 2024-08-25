// @ts-nocheck
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

import EmbeddingTypes from WatsonXAI.foundation_models.utils.enums ;
import Embeddings from ibm_watsonx_ai.foundation_models;
// import GenTextParamsMetaNames as GenParams from ibm_watsonx_ai.metanames;
// import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const env = require("../config/env.js");
// const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const logger = require("../config/logger.js");
const HttpException = require("../lib/exception.js");
const { RESPONSE_CODE } = require("../types/index.js");

export default class WatsonXService {
    constructor() {
        this.watsonxAIService = WatsonXAI.newInstance({
            version: '2023-05-29',
            serviceUrl: env.WATSONX_URL,
            // serviceUrl: 'https://us-south.ml.cloud.ibm.com',
            apiKey: env.WATSONX_API_KEY,
        });
    }

    const my_credentials = {
        "url": serviceUrl,
        "apikey": apiKey,
    }

    async generateEmbedding(data) {

        if (!data) {
            data = "Hello there.";
        }

        console.log("debug 1");

    //       // Get available embedding models
    // const listModelParams = {
    //     'filters': "function_embedding"
    // }

    // const listModels = await watsonxAIService.listFoundationModelSpecs(listModelParams)
    // const modelList = listModels.result.resources.map(model => model.model_id);
    // console.log("\n\n***** LIST OF AVAILABLE EMBEDDING MODELS *****");
    // console.log(modelList);
        
    const chunkText = await this.chunkText(data);
    const result = [] as { embedding: number[]; content: string }[];
// model- ibm/granite-13b-chat-v2
    for (const chunk of chunkText) {
            const params = {
                input: chunk,
                modelId: EmbeddingTypes.IBM_SLATE_30M_ENG, // Replace with the actual WatsonX embedding model ID
                projectId: env.WATSONX_PROJECT_ID,
                spaceId: "False",
                parameters: {
                    max_new_tokens: 100,
                    temperature = 0.1 // Adjust parameters as needed for embedding
                },
            };
                

            try {
                const response = await this.watsonxAIService.embedText(params);
                result.push({
                    content: chunk,
                    embedding: response.result.results, // Adjust to match the WatsonX API response
                });

            } catch (err) {
                logger.error("Error generating embedding", err);
                throw new HttpException(RESPONSE_CODE.GENERATIVE_AI_ERROR, "Error generating embedding", 400);
            }

        return result;
    }

    // public async chunkText(data: string) {
    //     if (!data) {
    //       throw new Error("Data is required");
    //     }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000, // max characters per chunk
            chunkOverlap: 150, // overlap between chunks
        });

        const tokens = await splitter.splitText(data as any);
        return tokens;
    }

    async functionCall(props) {
        let resp = {
            error: null,
            data: null,
        };


        try {
            const model_params = {
                input: props.prompt,
                modelId: 'ibm/granite-13b-chat-v2', // Replace with the actual WatsonX function calling model ID
                projectId: env.WATSONX_PROJECT_ID,
                parameters: {
                    max_new_tokens: 1000,
                    temperature:0.1,
                    top_k:30,
                    top_p:0.95,
                },
                spaceId: 'False',
            };

            const response = await this.watsonxAIService.functionCall(model_params);
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
                modelId: 'ibm/granite-13b-chat-v2', // Replace with the actual WatsonX model ID
                projectId: env.WATSONX_PROJECT_ID,
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

            const response = await this.watsonxAIService.generateText(params);
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
