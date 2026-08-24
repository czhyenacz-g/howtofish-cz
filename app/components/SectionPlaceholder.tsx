export default function SectionPlaceholder({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-4 text-3xl font-bold">{title}</h1>
      <div className="space-y-4 text-gray-400">{children}</div>
    </div>
  );
}
