interface Props {
  testStr: string
  setTestStr: (v: string) => void
  replaceMode: boolean
  replaceStr: string
  setReplaceStr: (v: string) => void
}

export default function TestStringInput({ testStr, setTestStr, replaceMode, replaceStr, setReplaceStr }: Props) {
  return (
    <section className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">Test String</label>
      <textarea
        value={testStr}
        onChange={e => setTestStr(e.target.value)}
        rows={6}
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors font-mono resize-y"
        spellCheck={false}
        placeholder="Enter test text here..."
      />
      {replaceMode && (
        <div className="flex gap-2 items-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Replace With</span>
          <input
            type="text"
            value={replaceStr}
            onChange={e => setReplaceStr(e.target.value)}
            placeholder="$1 replacement string..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm outline-none focus:border-cyan-500 transition-colors font-mono"
            spellCheck={false}
          />
        </div>
      )}
    </section>
  )
}
