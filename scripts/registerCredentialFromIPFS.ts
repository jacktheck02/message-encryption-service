import { uploadToIPFS } from "./uploadToPinata";
import { ethers } from "hardhat";
import { ethers as v6ethers } from "ethers";
import "dotenv/config";

async function main() {
  // 1. Upload data to IPFS via Pinata
  const data = "Alice's credential: Decentralized verification!";
  const cid = await uploadToIPFS(data);

  // 2. Hash CID for contract usage
  const cidHash = v6ethers.keccak256(v6ethers.toUtf8Bytes(cid));
  console.log("CID:", cid, "Hash:", cidHash);

  // 3. Register in CredentialManager
  const [issuer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("CredentialManager");
  const cm = await factory.deploy();
  await cm.waitForDeployment();

  const tx = await cm.connect(issuer).registerCredential(cidHash);
  await tx.wait();
  console.log("Credential hash registered in contract. Tx:", tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
