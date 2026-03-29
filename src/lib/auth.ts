import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

export async function hashPassword(plain: string): Promise<string> {
    return await bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
}

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT_SECRET in environment variables");
    return new TextEncoder().encode(secret);
};

export interface TokenPayload {
    id: string;
    name: string;
    phone: string;
    role: string; // This is the App Role ('admin', 'pt', 'client')
}

export async function signToken(payload: TokenPayload): Promise<string> {
    const jwtPayload = {
        ...payload,
        sub: payload.id,          // Required by Supabase auth.uid()
        app_role: payload.role,   // Custom role mapping for RLS policies
        role: 'authenticated'     // Required by Supabase to pass RLS
    };
    
    return await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        // Map app_role back to role for internal application logic
        return {
            id: payload.id as string,
            name: payload.name as string,
            phone: payload.phone as string,
            role: payload.app_role as string || payload.role as string,
        };
    } catch (e) {
        return null;
    }
}
