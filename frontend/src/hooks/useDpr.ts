import { useState, useEffect } from "react";

const useDpr = () => {
  const [dpr, setDpr] = useState(window.devicePixelRatio);
  useEffect(() => {
    const listener = () => {
      console.log("listener");
      setDpr(window.devicePixelRatio);
    };
    const media = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    media.addListener(listener);
    return () => {
      media.removeListener(listener);
    };
  }, [dpr]);
  return dpr;
};
export default useDpr;
