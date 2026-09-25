/**
 * Renders a JSON-LD block. `<` is escaped so a string in the data can never
 * close the script tag early — the structured-data flavour of Build
 * Standard §1.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
