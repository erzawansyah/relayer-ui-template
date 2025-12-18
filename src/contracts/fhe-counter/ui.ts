import type { ContractUIType } from "../../types/ui";

export const ui: ContractUIType = {
  summary: {
    file: "FHECounter.sol",
    name: "FHECounter",
    slug: "fhe-counter",
    label: "FHE Counter",
    description:
      "An encrypted counter that supports increment and decrement operations using Fully Homomorphic Encryption (FHE).",
    details:
      "This example stores a counter value as encrypted data (euint32). Users can update the counter by submitting encrypted inputs along with valid proofs. All arithmetic operations are performed directly on ciphertexts, and decryption permission for the updated counter is granted to the caller.",
  },

  states: [
    {
      name: "_count",
      type: "euint32",
    },
  ],

  functions: [
    {
      name: "getCount",
      type: "read",
      description: "Retrieve the current encrypted counter value.",
      inputs: [],
      outputs: [
        {
          name: "count",
          type: "euint32",
        },
      ],
    },
    {
      name: "increment",
      type: "write",
      description:
        "Increment the encrypted counter by a specified encrypted value.",
      inputs: [
        {
          name: "inputEuint32",
          type: "externalEuint32",
          helper: "Encrypted uint32 value to add to the counter.",
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
      name: "decrement",
      type: "write",
      description:
        "Decrement the encrypted counter by a specified encrypted value.",
      inputs: [
        {
          name: "inputEuint32",
          type: "externalEuint32",
          helper: "Encrypted uint32 value to subtract from the counter.",
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
  ],
};
