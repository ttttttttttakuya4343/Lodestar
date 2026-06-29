// good / redo 用のラベル付きテキスト入力（自動リサイズは行わず素直な textarea）。
interface JournalTextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function JournalTextField({
  label,
  placeholder,
  value,
  onChange,
}: JournalTextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-card border border-line bg-surface p-3 text-base text-text outline-none placeholder:text-text-weak focus:border-accent"
      />
    </label>
  );
}
