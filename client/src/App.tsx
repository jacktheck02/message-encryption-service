import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract} from 'wagmi';
import { DIDRegistryABI, DIDRegistryAddress } from "../contracts/DIDRegistry";

const App = () => {
  const { address, isConnected } = useAccount();

  const did = address
    ? `did:eth:${address.toLowerCase()}`
    : "";

  const {data, error} = useReadContract({
    abi: DIDRegistryABI,
    account: DIDRegistryAddress,
    functionName: "getDID",
    args: [did]
  });

  const { writeContract: registerDID } = useWriteContract();

  if (!isConnected) {
    return (
      <div>Please connect your wallet to continue.<ConnectButton/></div>
    );
  }

  if (!data || error) {
    return (
      <div>
        <p>Your DID: {did}</p>
        <button
          onClick={() => {
            registerDID({
              address: DIDRegistryAddress,
              abi: DIDRegistryABI,
              functionName: "registerDID",
              args: [address, "initial-doc-hash"]
            });
          }}
        >
          Register Identity
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Welcome, your DID is registered!</p>
      <p>DID: {did}</p>

      <h3>You can now access the messaging UI!</h3>
    </div>
  );
};

export default App;
