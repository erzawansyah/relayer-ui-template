import { useMemo, useState } from "react"
import { useAccount } from "wagmi"
import Header from "./components/Header"
import ConnectBox from "./components/ConnectBox"

// Import manifest statis (Vite dan banyak setup React support ini)
import manifest from "./assets/example.manifest.json"

type TabKey = "read" | "write" | "helpers"

type UiManifest = typeof manifest

type ManifestWrite = {
  id?: string
  fn: string
  label?: string
  description?: string
  group?: string
  advanced?: boolean
  args?: ManifestArg[]
  out?: ManifestOut[]
  tx?: {
    buttonLabel?: string
  }
}

function isTabKey(x: string): x is TabKey {
  return x === "read" || x === "write" || x === "helpers"
}

function App() {
  const account = useAccount()

  const m = manifest as UiManifest

  const availableTabs = useMemo(() => {
    const tabs = (m.ui?.tabs ?? ["read", "write", "helpers"]).filter(isTabKey)
    return tabs.length ? tabs : (["read", "write", "helpers"] as TabKey[])
  }, [m.ui?.tabs])

  const [activeTab, setActiveTab] = useState<TabKey>(
    (m.ui?.defaultTab && isTabKey(m.ui.defaultTab) ? m.ui.defaultTab : availableTabs[0]) ?? "read"
  )

  // Form state sederhana untuk semua function
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({})

  function setValue(key: string, value: string | number | boolean) {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  if (!account.isConnected) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <ConnectBox />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <ContractHeader m={m} />

        <Tabs tabs={availableTabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === "read" && (
          <Section title="Read Contract">
            <div className="space-y-6">
              {(m.views ?? []).map((v) => (
                <FunctionCard
                  key={v.id ?? v.fn}
                  kind="read"
                  fnName={v.fn}
                  label={v.label}
                  description={v.description}
                  group={v.group}
                  advanced={v.advanced}
                  args={(v.args ?? []) as ManifestArg[]}
                  out={v.out ?? []}
                  buttonLabel={v.call?.buttonLabel ?? "Call"}
                  formValues={formValues}
                  setValue={setValue}
                />
              ))}
            </div>
          </Section>
        )}

        {activeTab === "write" && (
          <Section title="Write Contract">
            <div className="space-y-6">
              {(m.writes ?? []).map((w) => (
                <FunctionCard
                  key={w.id ?? w.fn}
                  kind="write"
                  fnName={w.fn}
                  label={w.label}
                  description={w.description}
                  group={w.group}
                  advanced={w.advanced}
                  args={(w.args ?? []) as ManifestArg[]}
                  out={(w as ManifestWrite).out ?? []}
                  buttonLabel={w.tx?.buttonLabel ?? "Send"}
                  formValues={formValues}
                  setValue={setValue}
                />
              ))}
            </div>
          </Section>
        )}

        {activeTab === "helpers" && (
          <Section title="Helpers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EncryptHelperCard m={m} formValues={formValues} setValue={setValue} />
              <DecryptHelperCard m={m} formValues={formValues} setValue={setValue} />
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

export default App

function ContractHeader({ m }: { m: UiManifest }) {
  const deployment = m.deployments?.[0]
  const c = deployment?.contracts?.[0]
  const s = m.starter
  return (
    <div className="mb-8 rounded-lg border border-neutral-800 p-4">
      <div className="text-sm text-neutral-400">Contract</div>
      <div className="font-semibold">{c?.name ?? "UnknownContract"}</div>

      <div className="text-xs text-neutral-500 mt-1">
        {s?.title ? `${s.title} · ` : ""}
        ChainId {deployment?.chainId ?? "-"} · {shortAddr(c?.address ?? "-")}
      </div>

      <div className="text-xs text-neutral-600 mt-2">
        ABI: {c?.abi ?? "-"}
      </div>
    </div>
  )
}

function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabKey[]
  active: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <div className="flex gap-3 mb-6">
      {tabs.map((t) => {
        const isActive = t === active
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={
              isActive
                ? "px-4 py-2 rounded bg-neutral-800"
                : "px-4 py-2 rounded bg-neutral-900 text-neutral-400 hover:text-neutral-200"
            }
          >
            {t === "read" ? "Read" : t === "write" ? "Write" : "Helpers"}
          </button>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="text-sm text-neutral-400 mb-3">{title}</div>
      {children}
    </div>
  )
}

type ManifestArg = {
  name: string
  hidden?: boolean
  virtual?: boolean
  enc?: string
  proof?: string
  ui?: {
    kind?: "number" | "text" | "textarea" | "toggle" | "bytes"
    label?: string
    placeholder?: string
    help?: string
    trueLabel?: string
    falseLabel?: string
  }
  label?: string
  constraints?: {
    min?: number
    max?: number
    required?: boolean
    equals?: string | number
  }
  defaults?: {
    value?: string | number | boolean
  }
}

type ManifestOut = {
  name?: string
  label?: string
  enc?: string
  decrypt?: {
    enabled?: boolean
    label?: string
    permissionHint?: string
  }
}

function FunctionCard(props: {
  kind: "read" | "write"
  fnName: string
  label?: string
  description?: string
  group?: string
  advanced?: boolean
  args: ManifestArg[]
  out: ManifestOut[]
  buttonLabel: string
  formValues: Record<string, string | number | boolean>
  setValue: (k: string, v: string | number | boolean) => void
}) {
  const {
    kind,
    fnName,
    label,
    description,
    group,
    advanced,
    args,
    out,
    buttonLabel,
    formValues,
    setValue,
  } = props

  const title = label ? `${label}` : fnName
  const signature = `${fnName}(${(args ?? []).filter((a) => !a.hidden && !a.virtual).map((a) => a.name).join(", ")})`

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="font-mono text-xs text-neutral-400 mt-1">{signature}</div>

          <div className="text-xs text-neutral-500 mt-1">
            {group ? `Group: ${group}` : ""}
            {advanced ? `${group ? " · " : ""}Advanced` : ""}
            {kind ? `${group || advanced ? " · " : ""}${kind.toUpperCase()}` : ""}
          </div>

          {description ? <div className="text-sm text-neutral-300 mt-3">{description}</div> : null}
        </div>

        <button className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500">
          {buttonLabel}
        </button>
      </div>

      {/* Args */}
      <div className="mt-4 space-y-3">
        {(args ?? []).map((a: ManifestArg) => {
          if (a.hidden) return null

          const key = `${fnName}::${a.name}`
          const uiKind = a.ui?.kind ?? inferUiKind(a)
          const labelText = a.ui?.label ?? a.label ?? a.name
          const helpText = a.ui?.help

          // Virtual args: tidak ada di ABI, hanya guardrail UI
          if (a.virtual) {
            return (
              <FieldWrapper key={key} label={labelText} help={helpText}>
                <TextInput
                  kind={uiKind}
                  placeholder={a.ui?.placeholder ?? ""}
                  value={formValues[key] ?? ""}
                  onChange={(v) => setValue(key, v)}
                />
              </FieldWrapper>
            )
          }

          // Encrypted args: user input plain, UI nanti encrypt
          if (a.enc) {
            const placeholder = a.ui?.placeholder ?? placeholderByEnc(a.enc)
            const rangeText = constraintHint(a.constraints, a.enc)
            return (
              <FieldWrapper
                key={key}
                label={`${labelText} (will encrypt to ${a.enc})`}
                help={[helpText, rangeText].filter(Boolean).join(" · ")}
              >
                <TextInput
                  kind={uiKind}
                  placeholder={placeholder}
                  value={formValues[key] ?? (a.defaults?.value ?? "")}
                  onChange={(v) => setValue(key, v)}
                />
                <div className="mt-2 text-xs text-neutral-500">
                  proof param: <span className="font-mono">{a.proof ?? "-"}</span> (auto-generated)
                </div>
              </FieldWrapper>
            )
          }

          // Plain args
          return (
            <FieldWrapper key={key} label={labelText} help={helpText}>
              <TextInput
                kind={uiKind}
                placeholder={a.ui?.placeholder ?? ""}
                value={formValues[key] ?? ""}
                onChange={(v) => setValue(key, v)}
              />
            </FieldWrapper>
          )
        })}
      </div>

      {/* Outputs */}
      {(out ?? []).length > 0 && (
        <div className="mt-6">
          <div className="text-xs text-neutral-400 mb-2">Output</div>
          <div className="space-y-3">
            {(out ?? []).map((o: ManifestOut, idx: number) => {
              const outLabel = o.label ?? o.name ?? `out${idx}`
              const enc = o.enc
              const showDecrypt = Boolean(o.decrypt?.enabled)
              return (
                <div key={`${fnName}::out::${idx}`} className="rounded border border-neutral-800 bg-neutral-900 p-3">
                  <div className="text-xs text-neutral-400 mb-1">
                    {outLabel} {enc ? `(encrypted ${enc})` : ""}
                  </div>
                  <div className="font-mono text-xs text-neutral-200 break-all">
                    {enc ? "0x..." : "(value)"}
                  </div>

                  {showDecrypt && (
                    <div className="mt-2 flex items-center gap-2">
                      <button className="px-3 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700">
                        {o.decrypt?.label ?? "Decrypt"}
                      </button>
                      {o.decrypt?.permissionHint ? (
                        <span className="text-xs text-neutral-500">{o.decrypt.permissionHint}</span>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function EncryptHelperCard({
  m,
  formValues,
  setValue,
}: {
  m: UiManifest
  formValues: Record<string, string | number | boolean>
  setValue: (k: string, v: string | number | boolean) => void
}) {
  type EncryptPreset = {
    id: string
    label?: string
    to?: string
    constraints?: {
      min?: number
      max?: number
      required?: boolean
      equals?: string | number
    }
    ui?: {
      kind?: "number" | "text" | "textarea" | "toggle" | "bytes"
      placeholder?: string
      trueLabel?: string
      falseLabel?: string
    }
  }

  const presets = (m.helpers?.encrypt?.presets ?? []) as EncryptPreset[]
  const enabled = Boolean(m.helpers?.encrypt?.enabled)

  const selectedKey = "helpers::encrypt::preset"
  const valueKey = "helpers::encrypt::value"

  const defaultPresetId = presets.length > 0 ? presets[0].id : ""
  const selectedPresetId = formValues[selectedKey] ?? defaultPresetId
  const selected = presets.find((p) => p.id === selectedPresetId) ?? presets[0]

  if (!enabled) {
    return (
      <div className="rounded-lg border border-neutral-800 p-4">
        <div className="font-semibold mb-2">Encrypt</div>
        <div className="text-sm text-neutral-500">Disabled by manifest</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="font-semibold mb-3">Encrypt</div>

      <FieldWrapper label="Preset">
        <select
          className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
          value={String(selectedPresetId)}
          onChange={(e) => setValue(selectedKey, e.target.value)}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label ?? p.id}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <FieldWrapper label="Value" help={constraintHint(selected?.constraints, selected?.to)}>
        <TextInput
          kind={selected?.ui?.kind ?? (selected?.to === "ebool" ? "toggle" : "number")}
          placeholder={selected?.ui?.placeholder ?? placeholderByEnc(selected?.to)}
          value={formValues[valueKey] ?? ""}
          onChange={(v) => setValue(valueKey, v)}
          trueLabel={selected?.ui?.trueLabel}
          falseLabel={selected?.ui?.falseLabel}
        />
      </FieldWrapper>

      <button className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
        Encrypt
      </button>

      <div className="mt-4 text-sm">
        <div className="text-neutral-400">Ciphertext</div>
        <div className="font-mono bg-neutral-900 p-2 rounded mb-2">0x...</div>

        <div className="text-neutral-400">Proof</div>
        <div className="font-mono bg-neutral-900 p-2 rounded">0x...</div>
      </div>
    </div>
  )
}

function DecryptHelperCard({
  m,
  formValues,
  setValue,
}: {
  m: UiManifest
  formValues: Record<string, string | number | boolean>
  setValue: (k: string, v: string | number | boolean) => void
}) {
  type DecryptPreset = {
    id: string
    label?: string
    ui?: {
      placeholder?: string
    }
  }

  const presets = (m.helpers?.decrypt?.presets ?? []) as DecryptPreset[]
  const enabled = Boolean(m.helpers?.decrypt?.enabled)

  const selectedKey = "helpers::decrypt::preset"
  const ciphertextKey = "helpers::decrypt::ciphertext"

  const defaultPresetId = presets.length > 0 ? presets[0].id : ""
  const selectedPresetId = formValues[selectedKey] ?? defaultPresetId
  const selected = presets.find((p) => p.id === selectedPresetId) ?? presets[0]

  if (!enabled) {
    return (
      <div className="rounded-lg border border-neutral-800 p-4">
        <div className="font-semibold mb-2">Decrypt</div>
        <div className="text-sm text-neutral-500">Disabled by manifest</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="font-semibold mb-3">Decrypt</div>

      <FieldWrapper label="Preset">
        <select
          className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
          value={String(selectedPresetId)}
          onChange={(e) => setValue(selectedKey, e.target.value)}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label ?? p.id}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <FieldWrapper label="Ciphertext">
        <textarea
          className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
          rows={4}
          placeholder={selected?.ui?.placeholder ?? "Paste ciphertext hex"}
          value={String(formValues[ciphertextKey] ?? "")}
          onChange={(e) => setValue(ciphertextKey, e.target.value)}
        />
      </FieldWrapper>

      <button className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
        Decrypt
      </button>

      {m.helpers?.decrypt?.permissions?.showHint ? (
        <div className="mt-3 text-xs text-neutral-500">
          {m.helpers.decrypt.permissions.hintText ?? "If decrypt fails, ensure permissions are granted."}
        </div>
      ) : null}

      <div className="mt-3 text-sm text-neutral-400">Result: -</div>
    </div>
  )
}

function FieldWrapper({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-neutral-300 mb-1">{label}</div>
      {help ? <div className="text-xs text-neutral-500 mb-2">{help}</div> : null}
      {children}
    </div>
  )
}

function TextInput(props: {
  kind: "number" | "text" | "textarea" | "toggle" | "bytes"
  value: string | number | boolean
  placeholder?: string
  onChange: (v: string | number | boolean) => void
  trueLabel?: string
  falseLabel?: string
}) {
  const { kind, value, placeholder, onChange, trueLabel, falseLabel } = props

  if (kind === "textarea") {
    return (
      <textarea
        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
        rows={3}
        placeholder={placeholder ?? ""}
        value={typeof value === "boolean" ? String(value) : (value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (kind === "toggle") {
    const v = Boolean(value)
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={v ? "px-3 py-2 rounded bg-green-700" : "px-3 py-2 rounded bg-neutral-800"}
          onClick={() => onChange(true)}
        >
          {trueLabel ?? "true"}
        </button>
        <button
          type="button"
          className={!v ? "px-3 py-2 rounded bg-red-700" : "px-3 py-2 rounded bg-neutral-800"}
          onClick={() => onChange(false)}
        >
          {falseLabel ?? "false"}
        </button>
      </div>
    )
  }

  const inputType = kind === "number" ? "number" : "text"
  return (
    <input
      type={inputType}
      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
      placeholder={placeholder ?? ""}
      value={typeof value === "boolean" ? String(value) : (value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function inferUiKind(a: ManifestArg): "number" | "text" | "textarea" | "toggle" | "bytes" {
  if (a.ui?.kind) return a.ui.kind
  if (a.enc === "ebool") return "toggle"
  return "number"
}

function placeholderByEnc(enc?: string) {
  if (!enc) return ""
  if (enc === "euint8") return "0 - 255"
  if (enc === "euint32") return "0 - 4294967295"
  if (enc === "ebool") return "true / false"
  return "value"
}

function constraintHint(constraints: {
  min?: number
  max?: number
  required?: boolean
  equals?: string | number
} | undefined, enc?: string) {
  if (!constraints && !enc) return ""
  const parts: string[] = []
  if (constraints?.min !== undefined) parts.push(`min ${constraints.min}`)
  if (constraints?.max !== undefined) parts.push(`max ${constraints.max}`)
  if (constraints?.required) parts.push("required")
  if (constraints?.equals) parts.push(`must equal "${constraints.equals}"`)
  if (!parts.length && enc) return `type ${enc}`
  return parts.join(" · ")
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
