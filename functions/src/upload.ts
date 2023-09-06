import serviceAccount from "./admin-credentials.json";
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// you also have to install gsutils and set cors on your bucket
// gcloud auth login
// gsutil cors set cors.json gs://prompt-draw.appspot.com

initializeApp({
    projectId: serviceAccount.project_id, 
    credential: cert(serviceAccount as ServiceAccount),
    databaseURL: "https://prompt-draw.appspot.com",
    storageBucket: "prompt-draw.appspot.com"
  });

export const uploadImage = async (imageBase64Str: string, name: string) => {

    const bucket = getStorage().bucket()
    const imageBuffer = Buffer.from(imageBase64Str, 'base64')
    //const imageByteArray = new Uint8Array(imageBuffer);
    const file = bucket.file(`${name}.png`);
    const options = { resumable: false, metadata: { contentType: "image/png" } }

    //options may not be necessary
    return file.save(imageBuffer, options)
    .then(() => {
        return file.getSignedUrl({
            action: 'read',
            expires: '03-09-2500'
          })
    })
    .then((urls: string[]) => {
        const url = urls[0];
        console.log(`Image url = ${url}`)
        return url
    })
    .catch((err: any) => {
        console.log(`Unable to upload image ${err}`)
    })
}