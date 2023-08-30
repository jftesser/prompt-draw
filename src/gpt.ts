import { extractJSON } from "./Utils";
import { getChat, getImage } from "./firebase/firebaseSetup";
import { Metaprompt } from "./game/State";
import { Message } from "./types";

const systemNote = `You are a fun and snarky party game. You simulate a demanding celebrity client who needs an outfit for an upcoming red carpet. You will identify yourself and create a brief for a bunch of up-and-coming designers (the players). The players will describe outfits that meet your brief and you will judge them on which one you like most. Always write in the first person. You’re yelling directly at these people!

Step 1: describe yourself and the brief
Make up a name and one sentence biography, including your name in your bio. Be outrageous and unexpected! You could be an actor, musician, artist, politician or anyone else who might walk a red carpet.

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
`

const getMessagesStepOne = (): Message[] => {
    const messages: Message[] = [{
        "role": "system",
        "content": systemNote
    }];
    return messages;
}

const getMessagesStepTwo = (metaprompt: Metaprompt, prompts: {[uid: string]: string}): Message[] => {
    const messages: Message[] = [
        {
            "role":"assistant",
            "content": JSON.stringify(metaprompt)
        },
        {
            "role": "user",
            "content": `Step 2 ${JSON.stringify(prompts)}`
        }
    ];

    return [...getMessagesStepOne(), ...messages];
}

const getMessagesStepThree = (metaprompt: Metaprompt, prompts: {[uid: string]: string}, judgements: { [uid: string]: string }): Message[] => {
    const messages: Message[] = [
        {
            "role":"assistant",
            "content": JSON.stringify(judgements)
        },
        {
            "role": "user",
            "content": `Step 3`
        }
    ];

    return [...getMessagesStepTwo(metaprompt, prompts), ...messages];
}

const getObject = async (messages: Message[]) => {
    const ret = await getChat({
        messages,
        temp: 0.7,
        model: "gpt-4"
    });
    const mess = ret.data as Message;
    const obj = extractJSON(mess.content);
    return obj;
}

export const stepOne = async () => {
    const obj = await getObject(getMessagesStepOne());
    return {
     celebrity: obj["Celebrity name"],
     metaprompt: obj["Message"]
    };
}

export const stepTwo = async(metaprompt: Metaprompt, prompts: {[uid: string]: string}) => {
    return getObject(getMessagesStepTwo(metaprompt, prompts));
}

export const stepThree = async(metaprompt: Metaprompt, prompts: {[uid: string]: string}, judgements: { [uid: string]: string }) => {
    return getObject(getMessagesStepThree(metaprompt, prompts, judgements));
}

export const getImageURL = async (prompt: string, celebrity: string) => {
    const fullPrompt = `Full body red carpet photo of ${celebrity} wearing ${prompt}`;
    const urls = (await getImage(fullPrompt)).data as string[];
    return urls[0];
}