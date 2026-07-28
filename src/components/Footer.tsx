import { getMessage } from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-vx-border px-5 py-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-vx-muted">
        <span>{getMessage("footer.copyright")}</span>
        <div className="flex gap-5">
          <a href="https://github.com/vortex-protocol" className="hover:text-vx-text transition-colors">
            {getMessage("footer.github")}
          </a>
          <a href="https://discord.gg/vortex" className="hover:text-vx-text transition-colors">
            {getMessage("footer.discord")}
          </a>
        </div>
      </div>
    </footer>
  );
}
