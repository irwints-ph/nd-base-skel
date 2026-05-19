// src/Button.tsx
type Props = {
  label: string;
  onClick?: () => void;
};

export default function Button({ label, onClick }: Props) {
  return <button onClick={onClick}>{label}</button>;
}