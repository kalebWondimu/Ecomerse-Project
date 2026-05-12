const emailService = require('../services/emailService');

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All contact fields are required.' });
    }

    await emailService.sendContactEmail({ name, email, subject, message });

    res.json({ message: 'Contact message sent successfully.' });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ message: 'Failed to send contact message. Please try again later.' });
  }
};