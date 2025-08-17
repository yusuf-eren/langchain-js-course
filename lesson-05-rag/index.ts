import dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
const products = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

import { z } from 'zod';

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';

const model = new ChatOpenAI({ model: 'gpt-4o' });

// INDEXING
const productsText = products.map(
  (p) => `
Başlık: ${p.name}.
Açıklama: ${p.description}.
Kategori: ${p.category}.
Price: ${p.price}.
Tags: ${p.tags.join(' ')}.
`
);

const vectorStore = await MemoryVectorStore.fromTexts(
  productsText,
  products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
  })),
  new OpenAIEmbeddings({ model: 'text-embedding-ada-002' })
);

const getProducts = tool(
  async ({ query }) => {
    const results = await vectorStore.similaritySearch(query, 2);
    return results.map((r) => `Ürün: ${r.pageContent}\n`);
  },
  {
    name: 'getProducts',
    description: 'Get Products by Given Query',
    schema: z.object({
      query: z.string(),
    }),
  }
);

const toolsByName = {
  getProducts: getProducts,
};

const llm = model.bindTools([getProducts]);

const messages = [
  new SystemMessage(`You are a helpful assistant`),
  new HumanMessage('Ayakkabı var mı?'),
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
