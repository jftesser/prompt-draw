import { extractJSON } from "./Utils";
import { getChat, getImage } from "./firebase/firebaseSetup";
import { Metaprompt, PastCelebrity } from "./game/State";
import { Message } from "./types";
import { z } from "zod";

const systemNote = (pastCelebs: string) => `You are a fun and snarky party game. You simulate a demanding celebrity client who needs an outfit for an upcoming red carpet. You must not be an alien, and please try not to use a space theme unless you feel really passionately about it. You will identify yourself and create a brief for a bunch of up-and-coming designers (the players). The players will describe outfits that meet your brief and you will judge them on which one you like most. Always write in the first person. You’re yelling directly at these people!

Step 1: describe yourself and the brief
Make up a name and one sentence biography, including your name in your bio. Be outrageous and unexpected! You could be an actor, musician, artist, politician or anyone else who might walk a red carpet. Remember, aliens don't walk red carpets.

Write a two sentence design brief for your outfit. Be wacky! You want attention from critics, the media and/or your fans. What will they be looking for?

Here are some examples of celebrities you've made up in the past. Use them as inspiration, but make sure this next celebrity is different in theme and tone:

${pastCelebs}

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

const getMessagesStepOne = (pastCelebs: string): Message[] => {
  const messages: Message[] = [
    {
      role: "system",
      content: systemNote(pastCelebs),
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
  prompts: { [uid: string]: string },
  pastCelebs: string
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

  return [...getMessagesStepOne(pastCelebs), ...messages];
};

const getMessagesStepThree = (
  metaprompt: Metaprompt,
  prompts: { [uid: string]: string },
  judgements: { [uid: string]: string },
  pastCelebs: string
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

  return [...getMessagesStepTwo(metaprompt, prompts, pastCelebs), ...messages];
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

const winnersToCelebs = (pastCelebrities: PastCelebrity[]) => {
  return pastCelebrities.slice(0,4).map(w => `${w.celebrityName}: ${w.celebrityDecription}`).join('\n');
}

const stepOneCodec = z.object({ Message: z.string(), "Celebrity name": z.string() });

export const stepOne = async (pastCelebrities: PastCelebrity[]): Promise<Metaprompt> => {
  const raw = await getObject(getMessagesStepOne(winnersToCelebs(pastCelebrities)));
  const parsed = stepOneCodec.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid Response");
  }
  const { data } = parsed;
  return {
    celebrity: data["Celebrity name"],
    metaprompt: data["Message"],
  };
};

export type StepTwoData = { [uid: string]: string };

const StepTwoCodec = z.record(z.string(), z.string());

export const stepTwo = async (
  metaprompt: Metaprompt,
  prompts: { [uid: string]: string },
  pastCelebrities: PastCelebrity[]
): Promise<StepTwoData> => {
  const raw = await getObject(getMessagesStepTwo(metaprompt, prompts, winnersToCelebs(pastCelebrities)));
  const parsed = StepTwoCodec.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid Response");
  }
  const { data } = parsed;

  if (Object.keys(prompts).some((name) => !Object.hasOwn(data, name))) {
    throw new Error("Invalid Response");
  }
  return data;
};

const StepThreeCodec = z.object({
  Winner: z.string(),
  Message: z.string(),
});

export const stepThree = async (
  metaprompt: Metaprompt,
  prompts: { [uid: string]: string },
  judgements: { [uid: string]: string },
  pastCelebrities: PastCelebrity[]
): Promise<{ uid?: string; message: string }> => {
  // TODO - try again on failure?
  const raw = await getObject(
    getMessagesStepThree(metaprompt, prompts, judgements, winnersToCelebs(pastCelebrities))
  );

  
  const parsed = StepThreeCodec.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid Response");
  }
  const { data } = parsed;

  // handle not having a winner
  if (data.Winner === "None") {
    return {
      message: data.Message,
    };
  }

  if (!Object.hasOwn(prompts, data.Winner)) {
    throw new Error("Invalid Response - invalid player!");
  }
  return {
    uid: data.Winner,
    message: data.Message,
  };
};

export const getImageURL = async (prompt: string, celebrity: string) => {
  const fullPrompt = `full-body celebrity red carpet fashion photograph of ${celebrity} the human wearing ${prompt} real photography awards show ceremony`;
  const urls = (await getImage({ prompt: fullPrompt, count: 1 }))
    .data as string[];
  return urls[0];
};
