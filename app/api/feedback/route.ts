import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, message } = body

    // Validate input
    if (!message || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Format the email subject based on feedback type
    const subject =
      type === 'idea' ? '💡 New Idea - SuperTool Feedback' : '🐛 Issue Report - SuperTool Feedback'

    // Format the email body
    const emailBody = `
      Feedback Type: ${type.toUpperCase()}
      User Email: ${email || 'Anonymous'}
      
      Message:
      ${message}
      
      ---
      Received at: ${new Date().toLocaleString()}
    `

    // Use Web3Forms (free email service)
    // Get your access key from https://web3forms.com/
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_ACCESS_KEY || 'YOUR_WEB3FORMS_KEY',
        subject: subject,
        from_name: 'SuperTool Feedback',
        to: 'hinardi93@gmail.com',
        reply_to: email || 'noreply@supertool.com',
        message: emailBody,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send email')
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback sent successfully',
    })
  } catch (error) {
    console.error('Error sending feedback:', error)
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 })
  }
}
