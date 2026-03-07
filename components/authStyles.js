export const AUTH_FORM_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-linear-to-b from-zinc-700 to-zinc-800 text-white inset-shadow-[0_1px_2px] inset-shadow-white/50 transition-colors text-shadow-xs hover:to-zinc-700 dark:from-zinc-600 dark:to-zinc-700 dark:inset-shadow-white/30 dark:hover:to-zinc-600 h-8 px-4 w-full";

export const CTA_BUTTON_STYLE = {
  backgroundImage: "linear-gradient(to bottom, #27272a, #18181b)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
};

export const INPUT_FIELD_CLASS =
  "flex h-10 w-full rounded-md border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-ring outline-none";

export const CAPTCHA_INPUT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 flex-1 font-mono tracking-widest uppercase text-center text-lg";
