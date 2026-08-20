import { setAuthTokenGetter } from "@workspace/api-client-react";

export function initApiClient() {
  setAuthTokenGetter(() => localStorage.getItem("noteshare_token"));
}
