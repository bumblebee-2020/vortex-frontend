// Message catalog for i18n
// Default English messages
export const messages = {
  nav: {
    branding: "Vortex",
    explore: "Explore",
    becomeSolver: "Become a Solver",
    docs: "Docs",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
} as const;

export type MessageKey = keyof typeof messages;
export type MessageCatalog = typeof messages;

export function getMessage(key: string, defaults?: Record<string, string>): string {
  const keys = key.split(".");
  let value: any = messages;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value === "string") {
    if (!defaults) return value;
    
    let result = value;
    for (const [placeholder, replacement] of Object.entries(defaults)) {
      result = result.replace(`{${placeholder}}`, replacement);
    }
    return result;
  }
  
  return key;
}
