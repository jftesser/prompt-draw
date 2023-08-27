import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_KEY}`,
});

export const  getDalle = async (msg: string, reaction = '') => {
    console.log('Getting DALL-E with prompt: ' + msg);
    const response = await openai.images.generate({
      prompt: msg,
      n: 1,
      size: '512x512',
      response_format: 'b64_json'
    });
    //functions.logger.info(response.data)
    const blob = response.data[0].b64_json;
    return blob;
  };
