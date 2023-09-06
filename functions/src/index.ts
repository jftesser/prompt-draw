import { randomUUID } from "crypto";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getChat } from "./openai";
import { uploadImage } from "./upload";
import { getStabilityImage } from "./stability";

exports.getImage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const data = request.data;
  const blobs = await getStabilityImage(data.prompt, data.count);

  const promises = blobs.map(async (blob) => {
    if (blob) {
      const url = await uploadImage(blob, randomUUID());
      return url;
    }
    return "";
  });

  const urls = await Promise.all(promises);
  return urls;
});

exports.getChat = onCall(async (request) => {
  if (!request.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const data = request.data;
  const resp = await getChat(
    data.messages,
    data.temp,
    data.model,
    data.functions
  );
  return resp;
});
