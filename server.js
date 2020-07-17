const Express= require('express');
const app= Express();
const mongoose= require('mongoose');

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const port= 3000;
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI||port,{
    useNewUrlParser: true,
    useUnifiedTopology: true
},()=>{
    console.log('connected to mongo')
});
//creating schema
const dataSchema= new mongoose.Schema({
    name:String,
    email:String,
    message:Array      
    
});


const Data =mongoose.model('Data',dataSchema);

// app.use(Express.static("pics"));
app.use(Express.static("public"));
app.use(Express.static("views"));
app.use(Express.static("thanks"));

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/views/index.html')
})
//sending files from html to mongoDB
const contactAdding = function(req,res,next){
    var name = req.body.name;   
    var email = req.body.email;
    var message= req.body.message;  
    //check if the email address is already in the DB
    Data.findOne({email:email},async(err,doc)=>{
        if(doc){
            // add message to the message section
            console.log('email already there')   
            doc.message.push(message);
            await doc.save();         
        }
        else{
            //create new one
            var addedContact = new Data({
                name:name,
                email:email,
                message:message
            });
            await addedContact.save((err)=>{
                if(err)return handleError(err);     
            })    
        }    
    })
    
    res.sendFile(__dirname+'/thanks/thanks.html');

    next();
}
//posting data and sending email
app.post('/contact',contactAdding, (req,res)=>{    

    
        const transporter = nodemailer.createTransport({
            service:'gmail',
            port: 587,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            }
        });
        
        //config mail details
        const mailData={
            from:'deepak.sirohiwal@xaviers.edu.in',
            to:'deepaksirohiwall@gmail.com',
            subject:"People wants to contact you!!",
            text:`${[req.body.name,req.body.email,req.body.message]}`
            
        }
        console.log(req.body.name);
         transporter.sendMail(mailData,(err,info)=>{
            if(err){
                return console.log(err);
        
            }else{
                console.log('email sent!!');
            }
           
        })
    
});
app.listen(process.env.PORT||port,(req,res)=>{ 
    console.log('server is running ');
});