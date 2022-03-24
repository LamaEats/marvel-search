import React from 'react';

export interface UseIntersection {
    <N extends React.RefObject<HTMLElement>, T extends () => unknown>(ref: N, cb: T): void;
}

const intersectionObserverOptions = {
    root: null,
    threshold: 1,
};

// Лейзи лоад для скролла. Дайте хуку рефку и коллбек
export const useIntersection: UseIntersection = (ref, callback): void => {
    React.useLayoutEffect(() => {
        if (ref.current) {
            const target = ref.current;

            const onIntersection: IntersectionObserverCallback = (entries, opts) => {
                const visible = entries.some((entry) => entry.intersectionRatio >= opts.thresholds[0]);

                if (visible) {
                    console.log(ref.current);
                    if (ref.current) {
                        opts.unobserve(ref.current);
                    }
                    callback();
                }
            };
            const observer = new IntersectionObserver(onIntersection, intersectionObserverOptions);
            observer.observe(target);

            return () => {
                observer.disconnect();
            };
        }
    }, [callback, ref]);
};
