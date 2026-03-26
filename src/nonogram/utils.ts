const binomial_cache: number[][] = [[1]]

export function binomial(n: number, k: number): number {
    if (n < 0 || k < 0 || k > n)
        return 0
    // fill cache if we have a cache miss
    while (n >= binomial_cache.length) {
        const next_row = [1]
        const previous_row = binomial_cache[binomial_cache.length - 1]!
        for (let i = 1; i < previous_row.length; i++)
            next_row.push(previous_row[i - 1]! + previous_row[i]!)
        next_row.push(1)
        binomial_cache.push(next_row)
    }
    return binomial_cache[n]![k]!
}