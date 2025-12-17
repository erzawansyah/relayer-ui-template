export interface MetadataAuthorType {
  name: string;
  email?: string;
  url?: string;
}

export interface ContractMetadataType {
  contract_file: string;
  contract_name: string;
  contract_address?: string;
  name: string;
  label: string;
  description: string;
  version: string;
  fhevm_version: string;
  category: "fundamental" | "pattern" | "application" | "advanced";
  tags: string[];
  concepts: string[];
  constructor_args?: string[];
  has_ui: boolean;
  authors: MetadataAuthorType[];
}
