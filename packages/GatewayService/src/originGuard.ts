const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean)

export function isOriginAllowed(originHeader?: string): boolean {
    if(!originHeader)
        return false

    return ALLOWED_ORIGINS.includes(originHeader)
}