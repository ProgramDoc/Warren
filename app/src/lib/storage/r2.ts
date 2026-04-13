import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

function getBucket(): string {
  return process.env.R2_BUCKET || "warren-documents";
}

export async function uploadToR2(
  userId: string,
  documentId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const r2Key = `documents/${userId}/${documentId}/${filename}`;
  const s3 = getR2Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: r2Key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return r2Key;
}

export async function getDownloadUrl(r2Key: string): Promise<string> {
  const s3 = getR2Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: r2Key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFromR2(r2Key: string): Promise<void> {
  const s3 = getR2Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: r2Key,
    })
  );
}
