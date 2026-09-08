import nodemailer from'nodemailer';


const transport = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
})

export default transport;