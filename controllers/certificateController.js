const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { Certificate } = require('../models/certificateModel'); // Replace with your model import
const apiResponse = require('../helper/apiResponse');
const multer = require('multer');

// Ensure folder exists
const certificateFolder = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certificateFolder)) {
    fs.mkdirSync(certificateFolder, { recursive: true }); // Create the folder recursively
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, certificateFolder); // Specify the folder to store certificates
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage }).single('pdf');

// Function to send email with the certificate as an attachment
const sendEmailWithAttachment = async (email, filePath) => {
    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,  // Update the host to your mail provider
        port: 465,                      // Use the appropriate port for your provider (465 for SSL)
        secure: true,                   // Use true for secure connection (SSL/TLS)
        auth: {
            user: process.env.EMAIL_USER, // Email address from .env
            pass: process.env.EMAIL_PASS,  // Password from .env
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Certificate',
        text: 'Please find your certificate attached.',
        attachments: [
            {
                filename: path.basename(filePath),
                path: filePath,
            }
        ]
    };

    // Send the email
    return await transporter.sendMail(mailOptions);
};


// Controller to handle uploading and emailing certificates
exports.uploadCertificate = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return apiResponse.ErrorResponse(res, 'File upload failed');
        }

        const { email } = req.body;

        // Validate email and file presence
        if (!email || !req.file) {
            return apiResponse.validationErrorWithData(
                res,
                'Email and PDF file are required'
            );
        }

        const filePath = req.file.path;

        try {
            // Save certificate details in the database (optional)
            // const certificate = await Certificate.create({
            //     email,
            //     filePath,
            // });

            // Send the email
            await sendEmailWithAttachment(email, filePath);

            return apiResponse.successResponseWithData(
                res,
                'Certificate uploaded and email sent successfully!',
                // certificate
            );
        } catch (error) {
            console.error('Upload or email error:', error);
            return apiResponse.ErrorResponse(
                res,
                'An error occurred while processing the certificate'
            );
        }
    });
};
