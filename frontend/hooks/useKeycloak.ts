import Keycloak from "keycloak-js";
import { useEffect, useState } from "react";

export const useKeycloak = () => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);

  useEffect(() => {
    const kc = new Keycloak({
      url: "http://localhost:8080",
      realm: "ocmpClient",
      clientId: "myclient",
    });

    kc.init({ onLoad: "login-required" }).then((authenticated) => {
      if (authenticated) setKeycloak(kc);
    });
  }, []);

  return keycloak;
};
