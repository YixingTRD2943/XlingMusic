import { useCallback, useEffect, useRef, useState } from "react";

export default class StateMapper<T> {
    private getFun: () => T;
    private cbs: Set<() => void> = new Set();
    private mountedRef = { current: true };

    constructor(getFun: () => T) {
        this.getFun = getFun;
    }

    notify = () => {
        if (!this.mountedRef.current) return;
        this.cbs.forEach(cb => cb?.());
    };

    useMappedState = () => {
        const [state, setState] = useState<T>(this.getFun);
        const mounted = useRef(true);

        const updateState = useCallback(() => {
            if (mounted.current) {
                setState(this.getFun());
            }
        }, []);

        useEffect(() => {
            mounted.current = true;
            this.cbs.add(updateState);

            return () => {
                mounted.current = false;
                this.cbs.delete(updateState);
            };
        }, [updateState]);

        return state;
    };
}

type UpdateFunc<T> = (prev: T) => T;

export class GlobalState<T> {
    private value: T;
    private stateMapper: StateMapper<T>;

    constructor(initValue: T) {
        this.value = initValue;
        this.stateMapper = new StateMapper(this.getValue);
    }

    public getValue = () => {
        return this.value;
    };

    public useValue = () => {
        return this.stateMapper.useMappedState();
    };

    public setValue = (value: T | UpdateFunc<T>) => {
        let newValue: T;
        if (typeof value === "function") {
            newValue = (value as UpdateFunc<T>)(this.value);
        } else {
            newValue = value;
        }

        this.value = newValue;
        this.stateMapper.notify();
    };
}
