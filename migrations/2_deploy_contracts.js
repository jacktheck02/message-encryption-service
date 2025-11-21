const CredentialManager = artifacts.require("CredentialManager");
const DIDRegistry = artifacts.require("DIDRegistry");
const MessageMetadata = artifacts.require("MessageMetadata");

module.exports = async function (deployer) {
  await deployer.deploy(DIDRegistry);
  await deployer.deploy(CredentialManager);
  await deployer.deploy(MessageMetadata);
};
