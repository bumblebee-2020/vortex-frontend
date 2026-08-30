// Source-of-truth message catalog. Keys are dot-namespaced by feature; values
// may contain {placeholder} tokens that are filled in at render time.
export const en = {
  "wallet.connect.cta": "Connect Freighter",
  "wallet.connect.connecting": "Connecting...",
  "wallet.connect.retry": "Retry Connection",
  "wallet.disconnect.cta": "Disconnect",
  "wallet.disconnect.aria": "Disconnect wallet {address}",
  "wallet.error.freighterUnavailable": "Freighter extension is not installed or enabled.",
  "wallet.error.connectFailed": "Failed to connect wallet.",

  "swap.chainPicker.title": "Select source chain",

  "swap.from.label": "From",
  "swap.from.amountLabel": "Amount to swap",
  "swap.from.amountPlaceholder": "0",
  "swap.from.selectChain": "Source chain, currently {name}",
  "swap.from.selectToken": "Select source token, currently {symbol}",
  "swap.from.approxValue": "≈ ${value}",

  "swap.to.label": "To",
  "swap.to.tokenGroup": "Destination token",
  "swap.to.quoteLoading": "Loading quote…",

  "swap.slippage.label": "Slippage tolerance",
  "swap.slippage.inputLabel": "Slippage tolerance percent",
  "swap.slippage.minOut": "Min out: {amount} {token}",

  "swap.quote.solver": "Best solver",
  "swap.quote.fillTime": "Est. fill time",
  "swap.quote.fillTimeValue": "~{seconds}s",
  "swap.quote.priceImpact": "Price impact",
  "swap.quote.priceImpactValue": "{percent}%",
  "swap.quote.priceImpactBelowMin": "<0.01",
  "swap.quote.protocolFee": "Protocol fee",
  "swap.quote.protocolFeeValue": "{percent}%",
  "swap.quote.rate": "Rate",
  "swap.quote.unavailable": "Live quote unavailable — showing an estimated rate.",
  "swap.quote.staleWarning": "Quote is stale. Please wait for a refresh before submitting.",
  "swap.quote.highPriceImpactWarning": "High price impact above {threshold}% — please review before swapping.",
  "swap.quote.noSolver": "No solver found for this route right now.",

  "swap.submit.connecting": "Connecting wallet…",
  "swap.submit.building": "Preparing swap…",
  "swap.submit.awaitingSignature": "Confirm in Freighter…",
  "swap.submit.submitting": "Submitting…",
  "swap.submit.findingRoute": "Finding best route…",
  "swap.submit.success": "Swap submitted ✓ — start a new swap",
  "swap.submit.enterAmount": "Enter an amount",
  "swap.submit.cta": "Swap {amount} {srcToken} → {dstToken}",
  "swap.submit.retryCta": "Retry: Swap {amount} {srcToken} → {dstToken}",

  "swap.destination.label": "Destination address",
  "swap.destination.placeholder": "G...",
  "swap.destination.invalidAddress": "Enter a valid Stellar address (starts with G).",

  "swap.disclaimer": "Swap settles directly on Stellar · No wrapped tokens · Protected by solver bonds",

  "home.hero.eyebrow": "Stellar Agentic Hackathon 2025",
  // The headline is split so the second line can keep its accent colour and the
  // line break. Translations may reorder the two lines' content freely.
  "home.hero.titleLine1": "Swap from any chain",
  "home.hero.titleLine2": "directly to Stellar.",
  "home.hero.body":
    "Vortex is an intent-based cross-chain protocol. Express what you want, and competing solvers race to fill it — no bridges, no wrapped assets, no trust assumptions beyond the solver bond.",

  "home.stats.totalVolume": "Total Volume",
  "home.stats.intentsFilled": "Intents Filled",
  "home.stats.activeSolvers": "Active Solvers",
  "home.stats.avgFillTime": "Avg Fill Time",

  "home.pipeline.title": "How it works",
  "home.pipeline.intent.label": "Intent",
  "home.pipeline.intent.sub": "You submit",
  "home.pipeline.auction.label": "Auction",
  "home.pipeline.auction.sub": "Solvers bid",
  "home.pipeline.relay.label": "Relay",
  "home.pipeline.relay.sub": "Best fills",
  "home.pipeline.settle.label": "Settle",
  "home.pipeline.settle.sub": "On Stellar",

  "home.feed.title": "Live Fills",
  "home.feed.viewAll": "View all →",

  "home.chains.title": "Supported chains",
  "home.chains.stellarDestination": "Stellar (dest.)",

  "notFound.breadcrumb": "Not Found",
  "notFound.eyebrow": "404",
  "notFound.title": "Page not found",
  "notFound.body": "The page you're looking for doesn't exist, or may have moved.",
  "notFound.backHome": "← Back to Vortex",

  // ── Empty states ──────────────────────────────────────────────────────────

  // /explore — filters match nothing
  "explore.empty.title": "No intents match your filters",
  "explore.empty.message": "Try adjusting or clearing your status and chain filters to see more results.",
  "explore.empty.clearFilters": "Clear filters",

  // /explore — error loading
  "explore.error.title": "Couldn't load intents",
  "explore.error.message": "Something went wrong fetching intents. Check your connection and try again.",

  // /my-intents — wallet connected but no intents yet
  "myIntents.empty.title": "No swaps yet",
  "myIntents.empty.message": "You haven't submitted any swaps from this wallet. Make your first swap to get started.",
  "myIntents.empty.cta": "Make your first swap →",

  // /my-intents — filter combination matches nothing
  "myIntents.filterEmpty.title": "No intents match your filters",
  "myIntents.filterEmpty.message": "Try a different status or chain filter, or clear all filters to see everything.",
  "myIntents.filterEmpty.clearFilters": "Clear filters",

  // ActivityFeed — empty on a fresh/quiet deployment
  "activityFeed.empty.title": "No activity yet",
  "activityFeed.empty.message": "Waiting for the first swap intents to arrive. Submit a swap to kick things off.",
  "activityFeed.empty.cta": "Swap now →",

  "activityFeed.status.live": "Live",
  "activityFeed.status.polling": "Polling",
  "activityFeed.error.unavailable": "Live feed unavailable right now.",
  "activityFeed.item.route": "{chain} · via {solver}",

  // solve/[address] — fill history empty
  "solverDetail.fillHistory.empty.title": "No fills yet",
  "solverDetail.fillHistory.empty.message": "Once this solver starts accepting and filling intents, their history will appear here.",
} as const;
