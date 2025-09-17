import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// Small site using revalidation (R2 Incremental Cache, DO Queue, D1 Tag Cache)
export default defineCloudflareConfig({
  queue: doQueue,
  // Only needed if you use revalidateTag/revalidatePath
  tagCache: d1NextTagCache,
});