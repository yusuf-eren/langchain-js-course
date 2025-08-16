import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({ model: 'gpt-4o' });

const systemPromptTemplate =
  'Translate the following from English into {language}';

const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', systemPromptTemplate],
  ['user', '{text}'],
]);

async function main() {
  const promptValue = await promptTemplate.invoke({
    language: 'Turkish',
    text: 'Hi!',
  });
  const result = await model.invoke(promptValue);
  console.log(result.content);
}

main();

async function chainExample() {
  const prompt = ChatPromptTemplate.fromTemplate(
    'tell me a joke about {topic}'
  );
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const chainResult = await chain.invoke({
    topic: 'animals',
  });

  console.log(chainResult);
}

chainExample();
