import { useEffect, useRef } from "react";

export default function useOnceEffect(
    cb: () => (() => void) | void,
    deps?: any[],
) {
    const flag = useRef<boolean>(false);

    useEffect(() => {
        if (flag.current) {
            return;
        }
        if (!deps || deps.every(_ => !!_)) {
            flag.current = true;
            return cb();
        }
    }, deps);
}
