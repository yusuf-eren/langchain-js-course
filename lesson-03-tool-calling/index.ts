import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from '@langchain/core/messages';

import { z } from 'zod';

const model = new ChatOpenAI({ model: 'gpt-4o' });

const getToday = tool(
  () => {
    return new Date().toISOString();
  },
  {
    name: 'getToday',
    description: "Get Today's Date",
  }
);

const getWeather = tool(
  ({ location }: { location: string }) => {
    return `The weather in ${location} is sunny`;
  },
  {
    name: 'getWeather',
    description: 'Get Weather of the Provided Location',
    schema: z.object({
      location: z.string(),
    }),
  }
);

const toolsByName = {
  getToday: getToday,
  getWeather: getWeather,
};

const llm = model.bindTools([getToday, getWeather]);

const messages = [
  new SystemMessage('You are a helpful assistant.'),
  new HumanMessage('İstanbulda hava nasıl?'),
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
