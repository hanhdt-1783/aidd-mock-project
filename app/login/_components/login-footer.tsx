import { t, type Language } from "@/lib/i18n/dictionary";

export default function LoginFooter({ lang }: { lang: Language }) {
  return (
    <footer
      className="flex items-center justify-center w-full"
      style={{
        padding: "40px 90px",
        borderTop: "1px solid #2E3940",
      }}
    >
      <p
        className="font-bold text-white text-center"
        style={{
          fontFamily: "'Montserrat Alternates', Montserrat, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: "24px",
        }}
      >
        {t(lang, "login.footer.copyright")}
      </p>
    </footer>
  );
}
