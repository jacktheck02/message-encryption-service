import { webcrypto } from "crypto";

// Node's built in Web Crypto API
const crypto = webcrypto as unknown as Crypto;

export async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
}

/**
 * Encrypt a message using recipient's public key
 */
export async function encryptMessage(
  message: string,
  recipientPublicKeyBase64: string
): Promise<string> {
  const publicKeyBuffer = base64ToArrayBuffer(recipientPublicKeyBase64);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    data
  );

  return arrayBufferToBase64(encrypted);
}

/**
 * Decrypt a message using your private key
 */
export async function decryptMessage(
  encryptedMessageBase64: string,
  privateKeyBase64: string
): Promise<string> {
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"]
  );

  const encryptedData = base64ToArrayBuffer(encryptedMessageBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Generate signing keypair
 */
export async function generateSigningKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
}

/**
 * Sign a message with your private signing key
 */
export async function signMessage(
  message: string,
  privateKeyBase64: string
): Promise<string> {
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    data
  );

  return arrayBufferToBase64(signature);
}

/**
 * Verify a message signature
 */
export async function verifySignature(
  message: string,
  signatureBase64: string,
  publicKeyBase64: string
): Promise<boolean> {
  const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signatureBuffer = base64ToArrayBuffer(signatureBase64);

  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signatureBuffer,
    data
  );
}

// Helper functions for encoding/decoding
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, "binary").toString("base64");
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
