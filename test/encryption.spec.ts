import { expect } from "chai";
import {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  generateSigningKeyPair,
  signMessage,
  verifySignature,
} from "../scripts/encryption";

describe("Encryption Module", function () {
  this.timeout(10000); // Crypto operations can be slow

  describe("Key Generation", () => {
    it("generates a valid encryption keypair", async () => {
      const { publicKey, privateKey } = await generateKeyPair();

      expect(publicKey).to.be.a("string");
      expect(privateKey).to.be.a("string");
      expect(publicKey.length).to.be.greaterThan(100);
      expect(privateKey.length).to.be.greaterThan(100);
      expect(publicKey).to.not.equal(privateKey);
    });

    it("generates a valid signing keypair", async () => {
      const { publicKey, privateKey } = await generateSigningKeyPair();

      expect(publicKey).to.be.a("string");
      expect(privateKey).to.be.a("string");
      expect(publicKey).to.not.equal(privateKey);
    });
  });

  describe("Encryption and Decryption", () => {
    it("encrypts and decrypts a message successfully", async () => {
      const { publicKey, privateKey } = await generateKeyPair();
      const message = "This is a secret message for blockchain identity!";

      const encrypted = await encryptMessage(message, publicKey);
      expect(encrypted).to.be.a("string");
      expect(encrypted).to.not.equal(message);

      const decrypted = await decryptMessage(encrypted, privateKey);
      expect(decrypted).to.equal(message);
    });

    it("encrypts different messages to different ciphertexts", async () => {
      const { publicKey } = await generateKeyPair();
      const message1 = "Message 1";
      const message2 = "Message 2";

      const encrypted1 = await encryptMessage(message1, publicKey);
      const encrypted2 = await encryptMessage(message2, publicKey);

      expect(encrypted1).to.not.equal(encrypted2);
    });

    it("fails to decrypt with wrong private key", async () => {
      const keyPair1 = await generateKeyPair();
      const keyPair2 = await generateKeyPair();
      const message = "Secret data";

      const encrypted = await encryptMessage(message, keyPair1.publicKey);

      try {
        await decryptMessage(encrypted, keyPair2.privateKey);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("Message Signing and Verification", () => {
    it("signs and verifies a message successfully", async () => {
      const { publicKey, privateKey } = await generateSigningKeyPair();
      const message = "Authenticate this DID transaction";

      const signature = await signMessage(message, privateKey);
      expect(signature).to.be.a("string");

      const isValid = await verifySignature(message, signature, publicKey);
      expect(isValid).to.be.true;
    });

    it("rejects tampered messages", async () => {
      const { publicKey, privateKey } = await generateSigningKeyPair();
      const message = "Original message";
      const tamperedMessage = "Tampered message";

      const signature = await signMessage(message, privateKey);
      const isValid = await verifySignature(tamperedMessage, signature, publicKey);

      expect(isValid).to.be.false;
    });

    it("rejects signatures from wrong key", async () => {
      const keyPair1 = await generateSigningKeyPair();
      const keyPair2 = await generateSigningKeyPair();
      const message = "Test message";

      const signature = await signMessage(message, keyPair1.privateKey);
      const isValid = await verifySignature(message, signature, keyPair2.publicKey);

      expect(isValid).to.be.false;
    });
  });

  describe("End-to-End Workflow", () => {
    it("simulates secure message exchange between two users", async () => {
      // Alice generates keys
      const aliceKeys = await generateKeyPair();
      const aliceSigningKeys = await generateSigningKeyPair();

      // Bob generates keys
      const bobKeys = await generateKeyPair();

      // Alice encrypts a message for Bob and signs it
      const message = "Hi Bob, this is Alice!";
      const encrypted = await encryptMessage(message, bobKeys.publicKey);
      const signature = await signMessage(message, aliceSigningKeys.privateKey);

      // Bob decrypts the message
      const decrypted = await decryptMessage(encrypted, bobKeys.privateKey);
      expect(decrypted).to.equal(message);

      // Bob verifies Alice's signature
      const isValid = await verifySignature(
        decrypted,
        signature,
        aliceSigningKeys.publicKey
      );
      expect(isValid).to.be.true;
    });
  });
});
