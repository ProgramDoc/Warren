import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

let client: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (!client) {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const env = process.env.PLAID_ENV || "sandbox";

    if (!clientId || !secret) {
      throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
    }

    const envMap: Record<string, string> = {
      sandbox: PlaidEnvironments.sandbox,
      development: PlaidEnvironments.development,
      production: PlaidEnvironments.production,
    };

    const configuration = new Configuration({
      basePath: envMap[env] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    });

    client = new PlaidApi(configuration);
  }
  return client;
}
