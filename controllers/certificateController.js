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
        service: 'gmail', // Replace with your email provider
        auth: {
            user: "shubham.kothavade09@gmail.com", // Email address from .env
            pass: "tmlgddxnhltjvzcj", // Password from .env
        }
    });

    const mailOptions = {
        from: "shubham.kothavade09@gmail.com",
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
