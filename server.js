const express = require('express');
const app = express();
const port = 3000;
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');


app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});


// ОТПРАВКА ПОЧТЫ

// Получите тестовый аккаунт
nodemailer.createTestAccount((err, account) => {

    // Настройки для отправки почты
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user:  'byrbitskaya2447@gmail.com',
            pass:  'wfkudiuazqcbzkcx',
        },
        tls: {
            rejectUnauthorized: false // Отключение проверки сертификата
        }
    });

    app.use(express.static('public'));

    // Обработка данных из формы
    app.use(express.json()); // Для обработки JSON данных
    app.use(express.urlencoded({ extended: true }));// Для обработки данных из формы

    app.post('/submit', (req, res) => {
        const { name, email, message } = req.body;

        // Настройки письма
        const mailOptions = {
            from:  '"Node js" <nodejs@example.com>', // Адрес отправителя
            to: 'byrbitskaya2447@gmail.com', // Адрес получателя
            subject: 'Новое сообщение с сайта', // Тема письма
            text: `Имя: ${name}\nEmail: ${email}\nСообщение: ${message}` // Текст письма
        };

        // Отправка письма
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Ошибка при отправке письма:', error);
                res.json({error:error, success:false});
            } else {
                console.log('Письмо успешно отправлено:', info.response);
                res.json({ success:true});
            }
        });
    });



//ОТПРАВКА ИЗОБРАЖЕНИЙ ЛАБЫ
    app.get('/api/getImageFilenames', (req, res) => {
        const imageDirectory = './public/images/lab'; // Adjust the path to your image directory

        // Read the filenames from the image directory
        fs.readdir(imageDirectory, (err, files) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to read image directory' });
            }

            const imageFilenames = files.filter(file => /\.(jpg|png|gif|jpeg)$/i.test(path.extname(file)));

            res.json({ filenames: imageFilenames });
        });
    });
});
