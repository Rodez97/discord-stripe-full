import { useContext } from "react";
import { GlobalElementsContext } from "../components/GlobalElementsProvider";

function useGlobalElements() {
  const context = useContext(GlobalElementsContext);

  if (context === undefined) {
    throw new Error(
      "useGlobalElements must be used within a GlobalElementsProvider"
    );
  }

  return context;
}

export default useGlobalElements;
