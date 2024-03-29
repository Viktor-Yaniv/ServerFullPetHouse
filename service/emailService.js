// emailService.js
import nodemailer from 'nodemailer';
import ConfirmationCode from '../models/ConfirmationCodeModel.js';
import bcrypt from 'bcryptjs';


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'zvyagin121212@gmail.com',
    pass: 'bqqwnyuvwpgfvmda',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Функция для генерации случайного четырехзначного кода
function generateRandomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const sendConfirmationCode = async (email) =>  {
    const code = generateRandomCode();
    const createdAt = new Date().getTime(); // Время создания кода
    const expirationTime = createdAt + 3600 * 1000;

    const saltRounds = 6; // Количество раундов хэширования
    const hashedCode = await bcrypt.hash(code, saltRounds);

  
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Confirmation Code',
      text: `Your confirmation code is: ${code}`,
    };
    console.log(`Adding confirmation code ${code} for email ${email} to confirmationCodes`);
  
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          console.log('Confirmation code email sent: ' + info.response);
  
          // Сохраняем данные о коде подтверждения в базе данных
          const confirmationCode = new ConfirmationCode({
            email,
            code: hashedCode,
            expirationTime: new Date(expirationTime),
          });
          
          try {
            await confirmationCode.save();
            console.log('Confirmation code saved to the database');
            resolve(code);
          } catch (dbError) {
            console.error(dbError);
            reject(dbError);
          }
        }
      });
    });
  };
  