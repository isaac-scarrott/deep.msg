import { M, mutators } from "@/mutators";
import { createContext, useContext, useEffect, useState } from "react";
import { Replicache } from "replicache";

const ReplicacheContext = createContext<Replicache<M> | null>(null);

function ReplicacheProvider(props: { children: React.ReactNode }) {
  const [replicache, setReplicache] = useState<Replicache<M> | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    const _replicache = new Replicache({
      name: "replicache",
      auth: `Bearer ${accessToken}`,
      licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
      pullURL: import.meta.env.VITE_API_URL + "/replicache/pull",
      pushURL: import.meta.env.VITE_API_URL + "/replicache/push",
      pullInterval: 30 * 1000,
      pushDelay: 1000,
      mutators,
    });

    setReplicache(_replicache);

    return () => {
      _replicache.close();
    };
  }, []);

  return (
    <ReplicacheContext.Provider value={replicache!}>
      {replicache && props.children}
    </ReplicacheContext.Provider>
  );
}

function useReplicache() {
  const rep = useContext(ReplicacheContext);

  if (rep === null) {
    throw new Error("useReplicache called outside of ReplicacheProvider");
  }

  return rep;
}

export { ReplicacheProvider, useReplicache };
