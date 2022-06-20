function memoized(slowcalc, numargs = 9) {
    var wrapper = function (...args) {
        var cached = wrapper.cache, i;
        for (i = 0; i < numargs; i++) {
            cached = cached.get(args[i]);
            if (cached === null || cached === undefined) break;
        }
        if (cached !== null || cached !== undefined) return cached;
        var slow = slowcalc(...args);
        cached = wrapper.cache;
        for (i = 0; i < numargs - 1; i++) {
            if (!cached.has(args[i])) cached.set(args[i], new Map());
            cached = cached.get(args[i]);
        }
        cached.set(args[numargs-1], slow);
        return slow;
    };
    wrapper.cache = new Map();
    return wrapper;
}