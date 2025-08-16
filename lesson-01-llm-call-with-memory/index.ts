import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatOpenAI({ model: 'gpt-4o' });

const messages = [
  new SystemMessage('You are a helpful assistant.'),
  new HumanMessage('What is the capital of France?'),
];

async function main() {
  const result = await model.invoke(messages);
  console.log(result.content);
  messages.push(result);
  messages.push(new HumanMessage('What I asked to you?'));
  const result2 = await model.invoke(messages);
  console.log(result2.content);
}

main();
