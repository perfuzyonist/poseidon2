import { resolve, dirname } from "node:path";
export function uploadsPath() {
  return resolve(
    process.env.UPLOADS_PATH ||
      resolve(
        dirname(resolve(process.env.DATABASE_PATH || "./data/poseidon.sqlite")),
        "uploads",
      ),
  );
}
