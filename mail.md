# Gmail SMTP Setup (ForensIQ)

This guide configures Gmail SMTP for purchase confirmation emails in the backend.

## 1) Important: Use App Password (not your normal Gmail password)

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

## 2) Update backend environment file

Open `backend/.env` and set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_16_char_app_password
MAIL_FROM="ForensIQ <yourgmail@gmail.com>"
```

Notes:
- `SMTP_USER` should be your full Gmail address.
- `MAIL_FROM` can be same Gmail address.
- For port `587`, `SMTP_SECURE=false` is correct (STARTTLS).

## 3) Restart backend

From project root:

```bash
cd backend
npm run dev
```

## 4) Verify it works

1. Complete a paid course purchase in the app.
2. Payment verification endpoint runs:
   - `POST /api/enroll/verify`
3. On success, backend sends confirmation mail to the logged-in user's email.

## 5) Troubleshooting

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

## 6) Security tips

- Never commit `.env` to git.
- Rotate App Password if exposed.
- Use a dedicated Gmail account for production sending.
