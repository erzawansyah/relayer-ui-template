import type { ContractMetadataType } from "../../types/metadata";

export const metadata: ContractMetadataType = {
  contract_file: "FHECounter.sol",
  contract_name: "FHECounter",
  contract_address: "",
  name: "fhe-counter",
  label: "FHE Encrypted Counter",
  description:
    "A fundamental example demonstrating an encrypted counter that can be incremented or decremented using Fully Homomorphic Encryption (FHE).",
  version: "1.0.0",
  fhevm_version: "0.9.1",
  category: "fundamental",
  tags: ["counter", "addition", "subtraction"],
  concepts: [],
  constructor_args: [],
  has_ui: true,
  authors: [
    {
      name: "M.E.W",
      email: "erzawansyah@gmail.com",
      url: "https://github.com/erzawansyah",
    },
  ],
};
