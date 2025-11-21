import { uploadToIPFS, uploadJSONToIPFS, downloadFromIPFS } from "../scripts/uploadToPinata";
import { expect } from "chai";
import "dotenv/config";

describe("Pinata/IPFS Utility", function () {
  this.timeout(20000); // IPFS can be slow!

  it("uploads raw data and downloads content by CID", async () => {
    const testString = "Credential integration test: " + Date.now();
    const cid = await uploadToIPFS(testString);

    // Validate CID format
    expect(cid).to.be.a("string");
    expect(cid).to.match(/^(Qm|ba)/);

    // Download and check the content
    const data = await downloadFromIPFS(cid);
    expect(data).to.equal(testString);
  });

  it("uploads JSON object and downloads as parsed object", async () => {
    const testJSON = { id: Date.now(), username: "testuser", message: "IPFS JSON test" };
    const cid = await uploadJSONToIPFS(testJSON);

    expect(cid).to.be.a("string");
    expect(cid).to.match(/^(Qm|ba)/);

    const data = await downloadFromIPFS(cid);
    // Sometimes IPFS returns as an object, sometimes string—robust check:
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    expect(parsed).to.deep.include(testJSON);
  });
});
