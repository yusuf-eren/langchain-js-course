import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { Exa } from 'exa-js';
import { z } from 'zod';

const exa = new Exa(process.env.EXASEARCH_API_KEY);

const model = new ChatOpenAI({ model: 'gpt-4o' });

const getWebResults = tool(
  async ({ query }) => {
    const webResults = await exa.searchAndContents(query);

    return webResults.results.map(
      (result) => `
    # Title: ${result.title}
    # Text: ${result.text}
    # Url: ${result.url}
    # Published Date ${result.publishedDate}
    `
    );
  },
  {
    name: 'getWebResults',
    description: 'Get Web Results by provided query',
    schema: z.object({
      query: z.string(),
    }),
  }
);

const toolsByName = {
  getWebResults: getWebResults,
};

const llm = model.bindTools([getWebResults]);

const messages = [
  new SystemMessage(
    `You are a helpful assistant. Today is ${new Date().toISOString()}`
  ),
  new HumanMessage('Dolar/TL kuru ne durumda?'),
];

async function main() {
  const result = await llm.invoke(messages);
  console.log('result.content', result.content);
  console.log('result.tool_calls', result.tool_calls);
  messages.push(result);

  for (const toolCall of result.tool_calls!) {
    const selectedTool = toolsByName[toolCall.name];
    const toolMessage = await selectedTool.invoke(toolCall);
    console.log('--toolMessage', toolMessage);
    messages.push(toolMessage);

    const finalResult = await llm.invoke(messages);
    console.log('---finalResult', finalResult.content);
  }
}

main();
