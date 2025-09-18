import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Minimal setup: keep only the Durable Object queue (no R2, no D1)
export default defineCloudflareConfig({
  queue: doQueue,
});