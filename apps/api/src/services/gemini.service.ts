import {
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
  type FunctionCall,
  type GenerateContentResult,
} from "@google/generative-ai";
import env from "../config/env.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import logger from "../config/logger.js";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE, type AgentType } from "../types/index.js";
import type { FunctionCallingNames } from "../types/agent.types.js";
import type { ICallAIProps, IFunctionCall } from "../types/gemini.types.js";

import { IamAuthenticator } from 'ibm-cloud-sdk-core';

// const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
import { WatsonXAI } from '@ibm-cloud/watsonx-ai';

// import ModelTypes from "ibm_watsonx_ai.foundation_models.utils.enums"
// import EmbeddingTypes from 'ibm_watsonx_ai.foundation_models.embeddings'
// import EmbedTextParamsMetaNames from ibm_watsonx_ai.metanames 
// import EmbeddingTypes from '@ibm-cloud/watsonx-ai' 
// import Embeddings from '@ibm-cloud/watsonx-ai' 
// import { WatsonxAI } from "@langchain/community/llms/watsonx_ai.js";

let watsonxAIService;

// const authenticator = new IamAuthenticator({
//   apikey: env.WATSONX_API_KEY,
//   url: env.WATSONX_URL, 
// });

// const options = {
//   authenticator,
//   // version: '2024-05-31',
// };

// authenticator: new IamAuthenticator({ apikey: env.WATSONX_API_KEY }),

export default class GeminiService {
  private genAI: GoogleGenerativeAI;
  // public watsonxAIService: WatsonxAI;
  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  //   this.watsonxAIService = new WatsonxAI({
  //     ibmCloudApiKey: env.WATSONX_API_KEY,
  //       projectId: env.WATSONX_PROJECT_ID,
  //       // apiKey: env.WATSONX_API_KEY,
  // });
    watsonxAIService = WatsonXAI.newInstance({
         authenticator: new IamAuthenticator({ apikey: env.WATSONX_API_KEY }),
         version:'2024.02.15',
         serviceUrl: env.WATSONX_URL,    
    });


//  const model_id = ModelTypes.GRANITE_13B_CHAT_V2
  }

  public async generateEmbedding(data: string) {
    if (!data) {
      // throw new Error("Data is required");
      data = "Hello there.";
    }

    console.log("debug 1")
  

    // const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    const chunkText = await this.chunkText(data);
    const result = [] as { embedding: number[]; content: string }[];
    // const result = [];
    for (const chunk of chunkText) {
      const params = {
        inputs: chunk,
        modelId: 'slate-30m-english-rtrvr-v2', // Replace with the actual WatsonX embedding model ID EmbeddingTypes.IBM_SLATE_30M_ENG.value, 
        projectId: env.WATSONX_PROJECT_ID,
        spaceId: "False",
        parameters: {
            max_new_tokens: 100,
            temperature: 0.1 // Adjust parameters as needed for embedding
        },
    };
    
      // const { embedding } = await model.embedContent(chunk);
      // const response = await watsonxAIService.Embeddings(params)
      const response = await watsonxAIService.embedText(params)
      const embedding_vector = response.result.results
      result.push({
        content: chunk,
        // embedding: embedding.values,
        embedding:embedding_vector,
      });
    }
    return result;
  }


  public async chunkText(data: string) {
    if (!data) {
      throw new Error("Data is required");
    }

    // Split the text into chunks
    // getting rid of any text overlaps
    // for eg "testing" -> "test", "ing"
  //   separators=[
  //     "\n\n",
  //     "\n",
  //     " ",
  //     ".",
  //     ",",
  //     "\u200b",  # Zero-width space
  //     "\uff0c",  # Fullwidth comma
  //     "\u3001",  # Ideographic comma
  //     "\uff0e",  # Fullwidth full stop
  //     "\u3002",  # Ideographic full stop
  //     "",
  // ],
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // max characters per chunk
      chunkOverlap: 150, // overlap between chunks
    });

    const tokens = await splitter.splitText(data as any);

    return tokens;
  }

  public async functionCall(props: IFunctionCall) {
    let resp = {
      error: null,
      data: null,
    } as { error: any; data: FunctionCall[] | null };
    try {
      const generativeModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [
          {
            // @ts-expect-error
            functionDeclarations: props.tools.map((t) => ({
              name: t.func_name as FunctionCallingNames,
              description: t.description,
              parameters: {
                type: t.parameters.type as FunctionDeclarationSchemaType,
                properties: t.parameters.properties,
                required: t.required,
              },
            })),
          },
        ],
      });

      const chat = generativeModel.startChat();
      // Send the message to the model.
      const result = await chat.sendMessage(props.prompt!);

      // For simplicity, this uses the first function call found.
      const call = result.response.functionCalls();

      logger.info("Function call:");
      logger.info(result.response.usageMetadata);

      resp.data = call;
      return resp;
    } catch (e: any) {
      logger.error("Error calling AI function", e);
      resp.error = e;
      throw new HttpException(
        RESPONSE_CODE.GENERATIVE_AI_ERROR,
        "Error calling AI function",
        400
      );
    }
  }

  private constructChatHistory(
    data: { userPrompt: string; aiPrompt: string }[]
  ) {
    const history = [] as { role: string; parts: { text: string }[] }[];
    for (const d of data) {
      history.push({
        role: "user",
        parts: [{ text: d.userPrompt }],
      });
      history.push({
        role: "system",
        parts: [{ text: d.aiPrompt }],
      });
    }
    return history;
  }

  // Call GEMINI AI to handle user's conversation
  public async callAI(props: ICallAIProps) {
    let resp: { data: string | null; error: string | null } = {
      data: null,
      error: null,
    };
    try {
      const genModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: props.instruction,
      });

      let result: GenerateContentResult;

      if (!props?.enable_call_history) {
        result = await genModel.generateContent(props.user_prompt);
      } else {
        const chat = genModel.startChat({
          history: props?.history,
          systemInstruction: props.instruction,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });

        result = await chat.sendMessage(props.user_prompt);
      }

      resp.data = result.response.text();
      return resp;
    } catch (e: any) {
      console.log(e);
      logger.error("GenAI response error", e);
      resp.error = e;
      return resp;
    }
  }

  public async similaritySearch() {}
}
