-- Bảng lưu trữ mã khóa (Passkeys / WebAuthn Credentials)
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id TEXT PRIMARY KEY, -- Credential ID (base64url)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    webauthn_user_id TEXT NOT NULL, -- User Handle dành cho WebAuthn
    counter BIGINT NOT NULL DEFAULT 0,
    device_type TEXT NOT NULL,
    backed_up BOOLEAN NOT NULL DEFAULT false,
    transports JSONB, -- Mảng các transport type như ['internal', 'usb', 'nfc']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index để tìm kiếm credential theo user_id nhanh hơn
CREATE INDEX IF NOT EXISTS idx_webauthn_creds_user ON webauthn_credentials(user_id);
