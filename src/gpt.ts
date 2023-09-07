import { match } from "fp-ts/lib/Either";
import { extractJSON } from "./Utils";
import { getChat, getImage } from "./firebase/firebaseSetup";
import { Metaprompt } from "./game/State";
import { Message } from "./types";
import * as t from "io-ts";

const systemNote = `You are a fun and snarky party game. You simulate a demanding celebrity client who needs an outfit for an upcoming red carpet. You must not be an alien, and please try not to use a space theme unless you feel really passionately about it. You will identify yourself and create a brief for a bunch of up-and-coming designers (the players). The players will describe outfits that meet your brief and you will judge them on which one you like most. Always write in the first person. You’re yelling directly at these people!

Step 1: describe yourself and the brief
Make up a name and one sentence biography, including your name in your bio. Be outrageous and unexpected! You could be an actor, musician, artist, politician or anyone else who might walk a red carpet. Remember, aliens don't walk red carpets.

Write a two sentence design brief for your outfit. Be wacky! You want attention from critics, the media and/or your fans. What will they be looking for?

Respond with json:

\`\`\`
{
"Celebrity name": "YOUR NAME",
"Message": "BIO & DESIGN BRIEF"
}
\`\`\`

Step 2: give critiques
For each garment, describe what you like and don’t like. Be insulting!

\`\`\`
{
"PLAYER NAME": "CRITIQUE",
"PLAYER NAME": "CRITIQUE",
...
}
\`\`\`

Step 3: pick a winner
Think about the garments you’ve seen, which one best fulfills your brief and matches your personality? That’s the winner!

\`\`\`
{
"Winner": "PLAYER NAME",
"Message": "EXPLANATION OF WHY THE PLAYER WON"
}
\`\`\`

You will be prompted to complete each step, one at a time.
`;

// don't consider case or trailing or leading whitespace for the purposes of matching gpt output
const fuzzyMatch = (a: string, b: string): boolean =>
  a.toLowerCase().trim() === b.toLowerCase().trim();

const fixKeyCase = (
  refObj: { [name: string]: string },
  transObj: { [name: string]: string }
) => {
  const refKeys = Object.keys(refObj);
  const newObj: { [name: string]: any } = {};
  for (const [transName, value] of Object.entries(transObj)) {
    const refName = refKeys.find((name) => fuzzyMatch(name, transName));
    if (refName) {
      newObj[refName] = value;
    }
  }
  return newObj;
};

const fixCase = (refObj: { [name: string]: string }, transName: string) => {
  const refKeys = Object.keys(refObj);
  const refName = refKeys.find((name) => fuzzyMatch(name, transName));
  if (refName) return refName;
  return transName;
};

const getMessagesStepOne = (): Message[] => {
  const messages: Message[] = [
    {
      role: "system",
      content: systemNote,
    },
    {
      role: "user",
      content: `Step 1`,
    },
  ];
  return messages;
};

const getMessagesStepTwo = (
  metaprompt: Metaprompt,
  prompts: { [name: string]: string }
): Message[] => {
  const messages: Message[] = [
    {
      role: "assistant",
      content: JSON.stringify(metaprompt),
    },
    {
      role: "user",
      content: `Step 2 ${JSON.stringify(prompts)}`,
    },
  ];

  return [...getMessagesStepOne(), ...messages];
};

const getMessagesStepThree = (
  metaprompt: Metaprompt,
  prompts: { [name: string]: string },
  judgements: { [name: string]: string }
): Message[] => {
  const messages: Message[] = [
    {
      role: "assistant",
      content: JSON.stringify(judgements),
    },
    {
      role: "user",
      content: `Step 3`,
    },
  ];

  return [...getMessagesStepTwo(metaprompt, prompts), ...messages];
};

const getObject = async (messages: Message[]) => {
  const ret = await getChat({
    messages,
    temp: 0.8,
    model: "gpt-4",
  });
  console.log(ret);
  const mess = ret.data as Message;
  const obj = extractJSON(mess.content);
  return obj;
};

const stepOneCodec = t.type({ Message: t.string, "Celebrity name": t.string });

export const stepOne = async (): Promise<Metaprompt> => {
  const raw = await getObject(getMessagesStepOne());
  const parsed = match(
    () => {
      throw new Error("Invalid Response");
    },
    (d: t.TypeOf<typeof stepOneCodec>) => d
  )(stepOneCodec.decode(raw));

  return {
    celebrity: parsed["Celebrity name"],
    metaprompt: parsed["Message"],
  };
};

export type StepTwoData = { [name: string]: string };

const StepTwoCodec = t.record(t.string, t.string);

export const stepTwo = async (
  metaprompt: Metaprompt,
  prompts: { [name: string]: string }
): Promise<StepTwoData> => {
  const raw = await getObject(getMessagesStepTwo(metaprompt, prompts));
  // TODO - try again on failure?
  const parsed = match(
    () => {
      throw new Error("Invalid Response");
    },
    (d: StepTwoData) => d
  )(StepTwoCodec.decode(raw));
  const fixed = fixKeyCase(prompts, parsed);

  if (Object.keys(prompts).some((name) => !Object.hasOwn(fixed, name))) {
    throw new Error("Invalid Response");
  }
  return fixed;
};

const StepThreeCodec = t.type({
  Winner: t.string,
  Message: t.string,
});

export const stepThree = async (
  metaprompt: Metaprompt,
  prompts: { [name: string]: string },
  judgements: { [name: string]: string }
): Promise<{ name: string; message: string }> => {
  // TODO - try again on failure?
  const raw = await getObject(
    getMessagesStepThree(metaprompt, prompts, judgements)
  );

  console.warn(raw);
  const parsed = match(
    () => {
      throw new Error("Invalid Response");
    },
    (d: t.TypeOf<typeof StepThreeCodec>) => d
  )(StepThreeCodec.decode(raw));

  parsed.Winner = fixCase(prompts, parsed.Winner);

  if (!Object.hasOwn(prompts, parsed.Winner)) {
    throw new Error("Invalid Response - invalid player!");
  }
  return {
    name: parsed.Winner,
    message: parsed.Message,
  };
};

export const getImageURL = async (prompt: string, celebrity: string) => {
  const fullPrompt = `Full body red carpet photo of ${celebrity} wearing ${prompt}`;
  const urls = (await getImage({ prompt: fullPrompt, count: 1 }))
    .data as string[];
  return urls[0];
};
