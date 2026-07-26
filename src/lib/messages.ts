// Message catalog for i18n
// Default English messages
export const messages = {
  footer: {
    copyright: "© 2025 Vortex Protocol · MIT License",
    github: "GitHub",
    discord: "Discord",
  },
} as const;

export type MessageKey = keyof typeof messages;
export type MessageCatalog = typeof messages;
