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
  const prompt = request.data;
  const blob = await getDalle(prompt);
  if (blob) {
    const url = await uploadImage(blob, randomUUID());
    return url;
  }

  throw new HttpsError(
    "aborted",
    "Couldn't get image."
  );
});
