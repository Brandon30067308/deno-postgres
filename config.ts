import { ClientOptions } from "https://deno.land/x/postgres/mod.ts";

const dbCreds: ClientOptions = {
  user: "deno-postgres",
  database: "denoapi",
  hostname: "localhost",
  host_type: "tcp",
  password: "12345",
  port: 5432,
  tls: {
    enforce: false,
  },
};

export { dbCreds };
