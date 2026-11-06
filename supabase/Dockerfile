FROM ghcr.io/supabase/edge-runtime:v1.70.5

WORKDIR /home/deno

# Layout matches the relative import in ml_functions (`../../../../src/lib/export`).
COPY supabase /home/deno/supabase
COPY src/lib/export /home/deno/src/lib/export
COPY src/lib/flow.ts /home/deno/src/lib/flow.ts

CMD ["start", "--main-service", "/home/deno/supabase/functions/main"]
