import {EventEmitter} from 'node:events'
import {sendEmail} from '../../utils/email.js'; // Importing the email utility
import { templateEmail } from '../templates/email.templates.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventEmitter = new EventEmitter()

eventEmitter.on('emailSent', async (emailDetails) => {
        await sendEmail({
          to: emailDetails.to,
          subject: emailDetails.subject || "Confirm Your Email Address",
          html: templateEmail({
            otp: emailDetails.otp
          }),
          attachments: [{
            filename: 'banner.jpg',
            path: path.join(__dirname, '../../../WhatsApp Image 2025-08-19 at 06.07.24_16bb826f.jpg'),
            cid: 'topImage' // This is used to reference the image in the HTML
          }]
        });
});

export default eventEmitter;
