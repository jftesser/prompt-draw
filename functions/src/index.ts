import {randomUUID} from "crypto";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getDalle} from "./openai";
import { uploadImage }  from "./upload";

exports.getImage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const data = request.data;
  const blobs = await getDalle(data.prompt, data.count);

  const promises = blobs.map(async (blob) => {
    if (blob) {
    const url = await uploadImage(blob, randomUUID());
    return url;
    }
    return '';
  });
  
  const urls = await Promise.all(promises);
  return urls;

});
