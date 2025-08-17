import 'dotenv/config';

import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';

import * as fs from 'fs';
const products = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

// {
//   "id": 6,
//   "name": "Kahverengi Deri Cüzdan",
//   "category": "Aksesuar",
//   "description": "Çok bölmeli, şık kahverengi deri cüzdan.",
//   "price": 499,
//   "tags": ["aksesuar", "cüzdan", "deri", "kahverengi"]
// }
const productsText = products.map(
  (p) => `
${p.name}. ${p.description}
Kategori: ${p.category}
Fiyat: ${p.price}
Etiketler: ${p.tags.join(' ')}
`
);

const vectorStore = await MemoryVectorStore.fromTexts(
  productsText,
  products.map((p) => ({ id: p.id })),
  new OpenAIEmbeddings({ model: 'text-embedding-ada-002' })
);

const results = await vectorStore.similaritySearchWithScore(
  'su geçirmez çadır',
  2
);

console.log(results);
