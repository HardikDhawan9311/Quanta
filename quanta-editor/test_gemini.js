const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "AIzaSyClSM_94yUXHkbZrq4Rq0e1dKtKML5n7cw" });

async function listModels() {
  try {
    const models = await ai.models.list();
    for await (const model of models) {
        if (model.name.includes("flash")) {
            console.log(model.name);
        }
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();
