import type { ContractUIType } from "../types/ui";

export const ui: ContractUIType = {
  summary: {
    file: "FHEAdd.sol",
    name: "FHEAdd",
    slug: "fhe-add",
    label: "FHE Add",
    description:
      "This contract demonstrates a simple addition application using Fully Homomorphic Encryption (FHE).",
    details:
      "This contract stores a counter as encrypted data (euint32). The counter can be incremented or decremented using encrypted inputs without ever decrypting the stored value on-chain.",
  },
  states: [],
  functions: [
    {
      name: "setA",
      type: "write",
      description: "Store encrypted input A into the contract.",
      inputs: [
        {
          name: "inputA",
          type: "externalEuint8",
          helper: "The encrypted value to be stored as A.",
        },
        {
          name: "inputProof",
          type: "bytes",
          helper: "Proof generated during encryption.",
        },
      ],
      outputs: [],
      config: {
        proofParam: "inputProof",
      },
    },
    {
      name: "setB",
      type: "write",
      description: "Store encrypted input B into the contract.",
      inputs: [
        {
          name: "inputB",
          type: "externalEuint8",
          helper: "The encrypted value to be stored as B.",
        },
        {
          name: "inputProof",
          type: "bytes",
          helper: "Proof generated during encryption.",
        },
      ],
      outputs: [],
      config: {
        proofParam: "inputProof",
      },
    },
    {
      name: "computeAPlusB",
      type: "write",
      description: "Compute the sum of encrypted A and B, store the result.",
      inputs: [],
      outputs: [],
    },
    {
      name: "getResult",
      type: "read",
      description: "Retrieve the encrypted result of A + B.",
      inputs: [],
      outputs: [
        {
          name: "result",
          type: "euint8",
        },
      ],
    },
  ],
};
