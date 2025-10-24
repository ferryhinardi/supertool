"use client"

import { useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function JSONBeautifyPage() {
  const [value, setValue] = useState("{\n  \"example\": true\n}")

  const handleBeautify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj, null, 2))
      toast.success("JSON beautified successfully 🎉")
    } catch (err) {
      toast.error("Invalid JSON format ⚠️")
    }
  }

  const handleMinify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj))
      toast.success("JSON minified ✅")
    } catch (err) {
      toast.error("Invalid JSON format ⚠️")
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    toast.success("Copied to clipboard 📋")
  }

  return (
    <main className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">JSON Beautifier</h1>

      <div className="flex gap-2">
        <Button onClick={handleBeautify}>Beautify</Button>
        <Button variant="secondary" onClick={handleMinify}>Minify</Button>
        <Button variant="outline" onClick={handleCopy}>Copy</Button>
      </div>

      <CodeMirror
        value={value}
        height="500px"
        theme="dark"
        extensions={[json()]}
        onChange={(val) => setValue(val)}
        className="border border-neutral-800 rounded-md overflow-hidden"
      />
    </main>
  )
}
