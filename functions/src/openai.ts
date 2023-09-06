import OpenAI from "openai";
import {
  CompletionCreateParamsNonStreaming,
  CreateChatCompletionRequestMessage,
} from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_KEY}`,
});

export const getDalle = async (msg: string, n = 1): Promise<string[]> => {
  console.log("Getting DALL-E with prompt: " + msg);
  const response = await openai.images.generate({
    prompt: msg,
    n: n,
    size: "512x512",
    response_format: "b64_json",
  });
  //functions.logger.info(response.data)
  const blobs = response.data.map(
    (d) =>
      d.b64_json ??
      (() => {
        throw new Error("No image data received");
      })()
  );
  return blobs;
};

export const getChat = async (
  msgs: Array<CreateChatCompletionRequestMessage>,
  temp: number,
  model = "gpt-4",
  functions:
    | OpenAI.Chat.Completions.CompletionCreateParams.Function[][]
    | null = null
) => {
  console.log(`Getting chat for ${model} with temp ${temp}`);
  const completion = await openai.chat.completions.create({
    model: model,
    messages: msgs,
    temperature: temp,
    ...(functions && { functions }),
  } as CompletionCreateParamsNonStreaming);
  let choices = completion.choices;
  if (choices.length) {
    let choice = choices[0].message;
    return choice;
  }
  return completion;
};
