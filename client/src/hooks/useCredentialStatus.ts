import { useReadContract } from "wagmi";
import { CredentialManagerABI } from "../contracts/CredentialManager";
import { keccak256, toUtf8Bytes } from "ethers";


export function useCredentialStatus() {
  const { data: hasCredential, isLoading, refetch } = useReadContract({
    address: import.meta.env.VITE_CREDENTIAL_MANAGER_ADDRESS,
    abi: CredentialManagerABI,
    functionName: "verifyCredential",
    args: [keccak256(toUtf8Bytes(localStorage.getItem("credential_blob")!))],
    query: {
      enabled: true,
    },
  });

  return {
    hasCredential: Boolean(hasCredential),
    isCredentialLoading: isLoading,
    refetchCredential: refetch
  };
}
