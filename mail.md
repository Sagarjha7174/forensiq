# Email Setup (ForensIQ)

This guide covers Azure Communication Services Email and Gmail SMTP for purchase confirmation emails in the backend.

## 1) Azure Communication Services Email (recommended for your current setup)

If your Azure test code uses:
- `new EmailClient(connectionString)`
- `client.beginSend(...)`

then configure backend with:

```env
AZURE_EMAIL_CONNECTION_STRING=endpoint=https://your-resource.communication.azure.com/;accesskey=your_access_key
AZURE_EMAIL_SENDER=DoNotReply@your-verified-domain.com
```

Notes:
- `AZURE_EMAIL_SENDER` must be a verified sender/domain in your Azure Communication Services Email resource.
- Keep semicolons in the connection string as-is.
- Backend now sends through Azure first when these two variables are set.

## 2) Gmail SMTP (alternative)

Important: Use App Password (not your normal Gmail password)

Google blocks normal account passwords for SMTP in most cases.
You should use a 16-character App Password.

### How to create App Password

1. Open your Google Account: https://myaccount.google.com
2. Go to **Security**.
3. Turn on **2-Step Verification** (required).
4. In Security, open **App passwords**.
5. Choose app: **Mail** (or Custom name like "ForensIQ Backend").
6. Generate and copy the 16-character password.

Use this generated value as `SMTP_PASS`.

## 3) Update backend environment file

Open `backend/.env` and set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_16_char_app_password
MAIL_FROM="ForensIQ <yourgmail@gmail.com>"
```

If you already have a full SMTP connection string (for example from Azure), you can use this instead:

```env
SMTP_CONNECTION_STRING=smtp://username:password@smtp.office365.com:587
MAIL_FROM="ForensIQ <your-verified-email@domain.com>"
```

Notes for Azure SMTP:
- Use `smtp://` with port `587` for STARTTLS.
- Use `smtps://` with port `465` for implicit TLS.
- URL-encode special characters in username/password (for example `@` as `%40`).
- `MAIL_FROM` should be an address allowed by your Azure/email provider tenant.

Notes:
- `SMTP_USER` should be your full Gmail address.
- `MAIL_FROM` can be same Gmail address.
- For port `587`, `SMTP_SECURE=false` is correct (STARTTLS).

## 4) Restart backend

From project root:

```bash
cd backend
npm run dev
```

## 5) Verify it works

1. Complete a paid course purchase in the app.
2. Payment verification endpoint runs:
   - `POST /api/enroll/verify`
3. On success, backend sends confirmation mail to the logged-in user's email.

## 6) Troubleshooting

### "Invalid login" or auth failed
- Make sure `SMTP_PASS` is App Password, not Gmail account password.
- Ensure 2-Step Verification is enabled.
- Regenerate App Password and try again.

### Mail not sending but payment succeeds
- This is expected if SMTP config is missing/wrong.
- Check backend logs for mail warnings/errors.

### Gmail account restrictions
- New Gmail accounts may rate-limit SMTP temporarily.
- Wait and retry after a short time.

## 7) Security tips

- Never commit `.env` to git.
- Rotate App Password if exposed.
- Use a dedicated Gmail account for production sending.
