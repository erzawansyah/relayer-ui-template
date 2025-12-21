// utils/resultParser.ts

// File ini berisi utilitas untuk "parsing" dan normalisasi hasil
// panggilan kontrak (read). Tujuannya adalah mendeteksi bentuk
// hasil (shape) dan mengubah nilai kompleks menjadi representasi
// yang mudah ditampilkan di UI (mis. pemendekan hex, konversi bigint).

export type ParserOptions = {
  maxDepth?: number;
  shortenHex?: boolean;
  hexHead?: number;
  hexTail?: number;
  stripTupleNumericKeys?: boolean;
};

export type ParsedResult = {
  shape: string;
  normalized: unknown;
};

// Cek apakah nilai adalah string hex yang diawali dengan "0x".
// Digunakan untuk memutuskan apakah perlu dipendekkan untuk tampilan.
function isHexString(v: unknown): v is `0x${string}` {
  return typeof v === "string" && v.startsWith("0x");
}

// Deteksi object yang menyerupai tuple hasil Ethers.js/solidity,
// yaitu memiliki kunci numerik ("0","1",...) dan juga kunci bernama.
// Fungsi ini membantu memutuskan apakah perlu menghapus kunci numerik
// agar tampilan lebih bersih (menampilkan hanya nama field).
function isTupleLikeObject(obj: Record<string, unknown>) {
  // Tuple result sering punya keys "0","1",... plus keys bernama
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;

  const numericKeys = keys.filter((k) => /^\d+$/.test(k));
  return numericKeys.length > 0 && numericKeys.length < keys.length;
}

// Hapus entri dengan kunci numerik dari object.
// Digunakan untuk membersihkan hasil tuple sehingga UI menampilkan
// hanya properti yang bermakna (nama field).
function stripNumericKeys(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!/^\d+$/.test(k)) out[k] = v;
  }
  return out;
}

// Potong string hex untuk tampilan: pertahankan sebagian kepala dan ekor.
// Contoh: 0x1234...abcd
function shortenHex(hex: `0x${string}`, head: number, tail: number) {
  if (hex.length <= 2 + head + tail) return hex;
  return `${hex.slice(0, 2 + head)}…${hex.slice(-tail)}`;
}

export function detectResultShape(data: unknown): string {
  // Tentukan "shape" (bentuk) dari data sehingga UI bisa memilih
  // representasi yang sesuai. Mis. 'hex', 'array', 'bigint', 'object', dll.
  if (data === null) return "null";
  if (data === undefined) return "undefined";
  if (typeof data === "bigint") return "bigint";
  if (Array.isArray(data)) return "array";
  if (isHexString(data)) return "hex";
  return typeof data === "object" ? "object" : typeof data;
}

export function normalizeResult(
  data: unknown,
  options: ParserOptions = {},
  depth = 0
): unknown {
  const {
    maxDepth = 6,
    shortenHex: doShortenHex = true,
    hexHead = 8,
    hexTail = 6,
    stripTupleNumericKeys: doStripTupleKeys = true,
  } = options;

  if (data === null || data === undefined) return data;

  if (depth >= maxDepth) {
    if (Array.isArray(data)) return `[Array(${data.length})]`;
    if (typeof data === "object") return "[Object]";
    return data;
  }

  if (typeof data === "bigint") return data.toString();

  if (isHexString(data)) {
    if (!doShortenHex) return data;
    return shortenHex(data, hexHead, hexTail);
  }

  if (Array.isArray(data)) {
    // Rekursif normalisasi setiap elemen array.
    return data.map((v) => normalizeResult(v, options, depth + 1));
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    // Jika object menyerupai tuple, strip kunci numeriknya agar
    // representasi menjadi lebih bersih untuk UI.
    const maybeTupleClean =
      doStripTupleKeys && isTupleLikeObject(obj) ? stripNumericKeys(obj) : obj;

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(maybeTupleClean)) {
      // Normalisasi setiap properti secara rekursif.
      out[k] = normalizeResult(v, options, depth + 1);
    }
    return out;
  }

  return data;
}

export function parseContractReadResult(
  data: unknown,
  options: ParserOptions = {}
): ParsedResult {
  // Fungsi utama yang menggabungkan deteksi bentuk dan normalisasi.
  // Mengembalikan objek yang memudahkan UI menampilkan hasil read.
  return {
    shape: detectResultShape(data),
    normalized: normalizeResult(data, options),
  };
}
