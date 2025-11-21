import  PinataClient  from "@pinata/sdk";
import "dotenv/config";
import { PassThrough } from "stream";
import axios from "axios";

// Instantiate Pinata correctly
const pinata = new PinataClient(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
);


export async function uploadToIPFS(data: string | Buffer): Promise<string> {
  // Convert your data to a Buffer if it's not already
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  // Use a Node PassThrough stream for Pinata's file API
  const stream = new PassThrough();
  stream.end(buffer);

  // Optional: add metadata for your file
  const options = {
    pinataMetadata: {
      name: "credential.txt", // filename shown in Pinata dashboard
    },
  };

  // Upload file to Pinata/IPFS
  const result = await pinata.pinFileToIPFS(stream, options);

  console.log("Uploaded to Pinata IPFS:", result.IpfsHash);
  return result.IpfsHash;
}

export async function uploadJSONToIPFS(json: any): Promise<string> {
  const result = await pinata.pinJSONToIPFS(json);
  console.log("Uploaded JSON to Pinata IPFS:", result.IpfsHash);
  return result.IpfsHash;
}

export async function downloadFromIPFS(cid: string): Promise<any> {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  const response = await axios.get(url);
  return response.data;
}