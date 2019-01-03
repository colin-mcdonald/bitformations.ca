var DEBUG = false

var express = require('express')
var bodyParser = require('body-parser')
var nodemailer = require('nodemailer')
var moment = require('moment-timezone')
var escape = require('escape-html')
var axios = require('axios')
var fs = require('fs')
var util = require('util')
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'a'})

var generator = require('xoauth2').createXOAuth2Generator({
    user: 'finesco.mailer@gmail.com',
    clientId: '346398935651-f7skbj0rl8903smvdr4hvlg17t4npd7q.apps.googleusercontent.com',
    clientSecret: 'o4kFKNhSawotwIRIJTceRdg8',
    refreshToken: '1/gX1UedDBSjRrkzXw5nFQO11pmdC3ZcG9W_OF2B5zK70MEudVrK5jSpoR30zcRFq6',
    // accessToken: '{cached access token}' // optional
})

generator.on('token', function(token){
    console.log('New token for %s: %s', token.user, token.accessToken)
})

var transporter = nodemailer.createTransport(({
    service: 'gmail',
    auth: {
        xoauth2: generator
    }
}))

var app = express()

if (DEBUG)
    app.use(express.static(__dirname + '/../'))

app.use(bodyParser.urlencoded({
  extended: true
}))

app.post('/post_contact_form', function (req, res) {
    var torontoDateTime = moment().tz("America/Toronto").format('DD-MM-YYYY hh:mm:ss A')
    var name = req.body.name,
        email = req.body.email,
        subject = req.body.phone,
        message = req.body.message,
        recaptcha = req.body['g-recaptcha-response']
    
        axios.post('https://www.google.com/recaptcha/api/siteverify', {
            secret: '6Le0qoYUAAAAACQduK-E0KVvCxXK-2sNOJW14Ywu',
            response: recaptcha
          })
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
                console.error("Failed re-captcha", response.data);
                res.write('FAILURE - BAD RECAPTCHA')
                return res.end() 
            }

            var txt_email = 'From: ' + name + ' <' + email + '>\n\n' + 'At: ' + torontoDateTime + ' (Toronto Time)\n\n' + 'Subject: ' + subject + '\n\n' + 'Message: ' + message + '\n\n --- END OF MESSAGE --- \n\n'
            if(!escape(message) || escape(message) === '')
              return;
        
            var html_email = '<html><p><h3>From:</h3>' + escape(name) + ' &lt;' + escape(email) + '&gt;</p><p><h3>At:</h3>' + escape(torontoDateTime) + ' (Toronto Time)</p><p><h3>Subject:</h3>' + escape(subject) + '</p><p><h3>Message:</h3>' + escape(message) + '</p><p> --- END OF MESSAGE --- </p>'
        
            var mailOptions = {
                from: 'BitFormations Contact Form<finescomailer@gmail.com>',
                to: 'colin@bitformations.ca',
            cc: email,
                subject: 'BitFormations Contact Form: ' + subject,
                text: txt_email,
                html: html_email
            }
        
            log_file.write('\n\n***** MESSAGE *****')
            log_file.write('\nHTML:\n' + html_email)
            log_file.write('\nTEXT:\n' + txt_email)
        
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error)
                log_file.write('Failed to Send Email: ' + error.toString())
                log_file.write('\n**** END OF MESSAGE ****\n')
                res.write('ERROR')
                res.end()
                } else {
                    console.log('Successfully Sent: ' + info.response)
                log_file.write('Successfully Sent: ' + info.response)
                log_file.write('\n**** END OF MESSAGE ****\n')
                res.write('OK')
                res.end()
                }
            })
          })
          .catch(function (error) {
            console.error(error);
          })    
})

var server = app.listen(process.env.PORT || 8002, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('BitFormations form server: Listening at http://%s:%s', host, port)
})