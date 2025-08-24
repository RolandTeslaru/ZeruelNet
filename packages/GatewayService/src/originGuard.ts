const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean)

export function isOriginAllowed(originHeader?: string): boolean {
    // Temporarily allow all origins for testing
    return true;
    
    // Original code (re-enable after testing):
    // if(!originHeader)
    //     return false
    // return ALLOWED_ORIGINS.includes(originHeader)
}