import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_KEY}`,
});

export const  getDalle = async (msg: string, n = 1) => {
    console.log('Getting DALL-E with prompt: ' + msg);
    const response = await openai.images.generate({
      prompt: msg,
      n: n,
      size: '512x512',
      response_format: 'b64_json'
    });
    //functions.logger.info(response.data)
    const blobs = response.data.map(d => d.b64_json);
    return blobs;
  };
