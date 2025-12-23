# Feedback System Setup Guide

## Overview

The feedback system allows users to submit ideas or report issues directly through the SuperTool interface. Feedback is sent via email to hinardi93@gmail.com.

## Components Created

### 1. FeedbackDialog Component

**Location:** `/components/features/FeedbackDialog.tsx`

A modal dialog that includes:

- Toggle between "Idea" and "Issue" feedback types
- Optional email field for follow-up
- Message textarea for detailed feedback
- Beautiful UI with gradient buttons and animations

### 2. API Route

**Location:** `/app/api/feedback/route.ts`

Handles feedback submission and sends emails using Web3Forms service.

### 3. Header Integration

**Location:** `/components/layout/Header.tsx`

Feedback button added to the header for easy access from any page.

## Setup Instructions

### Step 1: Get Web3Forms API Key

1. Visit [https://web3forms.com/](https://web3forms.com/)
2. Sign up for a free account
3. Create a new form and get your Access Key
4. The free tier includes 250 submissions per month

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory (if it doesn't exist):

   ```bash
   touch .env.local
   ```

2. Add your Web3Forms access key:

   ```env
   WEB3FORMS_ACCESS_KEY=your_actual_key_here
   ```

3. Make sure `.env.local` is in your `.gitignore` file

### Step 3: Restart Development Server

```bash
npm run dev
# or
pnpm dev
```

## Features

### User Features

- **Two Feedback Types:**
  - 💡 **Idea:** For feature suggestions and improvements
  - 🐛 **Issue:** For bug reports and problems

- **Optional Email:** Users can provide their email if they want a follow-up

- **Anonymous Submissions:** Email field is optional, allowing anonymous feedback

### Email Format

Feedback emails include:

- Feedback type (Idea/Issue) in the subject
- User's email (or "Anonymous")
- Full message content
- Timestamp

### UI/UX Highlights

- Accessible from header on all pages
- Beautiful gradient design
- Loading states during submission
- Success/error toast notifications
- Mobile-responsive design

## Alternative Email Services

If you prefer a different email service, you can modify `/app/api/feedback/route.ts`:

### Option 1: Nodemailer (with Gmail)

```typescript
// Install: npm install nodemailer
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // Use App Password, not regular password
  },
})

await transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'hinardi93@gmail.com',
  subject: subject,
  text: emailBody,
})
```

### Option 2: SendGrid

```typescript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

await sgMail.send({
  to: 'hinardi93@gmail.com',
  from: 'verified-sender@yourdomain.com',
  subject: subject,
  text: emailBody,
})
```

### Option 3: Resend (Modern Alternative)

```typescript
// Install: npm install resend
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'feedback@yourdomain.com',
  to: 'hinardi93@gmail.com',
  subject: subject,
  text: emailBody,
})
```

## Testing

### Test the Feedback Form:

1. Start your development server
2. Click the "Feedback" button in the header
3. Select either "Idea" or "Issue"
4. Fill in the message (email is optional)
5. Click "Send Feedback"
6. Check your inbox at hinardi93@gmail.com

### Verify Email Receipt:

- Check inbox for new feedback
- Verify subject line format
- Confirm message content is complete
- Check timestamp is accurate

## Troubleshooting

### Issue: Emails not sending

**Solution:**

- Check if `WEB3FORMS_ACCESS_KEY` is set in `.env.local`
- Verify the API key is correct
- Check browser console for errors
- Review server logs for API errors

### Issue: "Failed to send feedback" error

**Solution:**

- Ensure you have internet connection
- Verify Web3Forms service is operational
- Check if you've exceeded the free tier limit (250/month)

### Issue: Environment variable not loading

**Solution:**

- Restart your development server after adding `.env.local`
- Verify file name is exactly `.env.local`
- Check file is in the root directory

## Future Enhancements

Consider adding:

- Feedback history/dashboard for admin
- Attachment support for screenshots
- Rate limiting to prevent spam
- Email notifications to users when feedback is reviewed
- Integration with issue tracking (GitHub Issues, Jira, etc.)
- Analytics on feedback types and frequency

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all API keys
- Consider adding rate limiting to prevent abuse
- Validate and sanitize all user inputs
- Consider adding CAPTCHA for public deployments

## Support

If you encounter any issues with the feedback system, check:

1. Environment variables are properly set
2. Development server has been restarted
3. API key is valid and active
4. Browser console for client-side errors
5. Server logs for API errors
