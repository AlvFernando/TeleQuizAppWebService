const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();
var validator = require('validator');

const mainController = {
    index : async function(req,res){
        res.send("Tele server is up");
    },

    //required as body:
    //key
    //username
    //password
    login : async function(req,res){
        if(req.body.key == process.env.API_KEY){
            try {
                const data = await sequelize.query("EXEC SP_login :username,:password", 
                { 
                    replacements: {
                        username: req.body.username, 
                        password: req.body.password
                    }, 
                    type: QueryTypes.SELECT 
                });
                res.send(data);
            } catch (error) {
                return res.status(500).json({error:'invalid username or password.'});
            } 
        }else{
            return res.status(500).json({error:'invalid key value.'});
        }
    },

    //required as body:
    //key
    //userTypeId
    quiz : async function(req,res){
        //1. demo
        //2. general
        //3. tele
        if(req.body.key == process.env.API_KEY){
            var statusCode;
            var message;
            var responseData;
            const spList = ['SP_GetQuizDemo','SP_GetQuizGeneral','SP_GetQuizTele'];
            try{
                const data = await sequelize.query("EXEC "+spList[parseInt(req.body.userTypeId)-1],
                { 
                    type: QueryTypes.SELECT 
                });
                statusCode = 200;
                message = 'success';
                responseData = data;
            }catch(error){
                statusCode = 500;
                message = 'invalid userTypeId.';
            }
        }else{
            statusCode = 500;
            message = 'invalid key value.';
        }
        return res.status(statusCode).json({
            message : message,
            data : (responseData) ? responseData : ''
        });
    },

    //required as params:
    //key
    //asset name
    assets : async function(req,res){
        if(req.params.key==process.env.API_KEY){
            try{
                res.sendFile(path.resolve('./')+'/assets/'+req.params.assetName);
            }catch(error){
                return res.status(500).json({error:'invalid asset name.'});
            }
        }else{
            return res.status(500).json({error:'invalid key value.'});
        }
    },

    //requires as body:
    //key
    //username
    profile : async function(req,res){
        if(req.body.key == process.env.API_KEY){
            try{
                const data = await sequelize.query("EXEC SP_Profile :username",{
                    replacements: {
                        username: req.body.username,
                    },
                    type: QueryTypes.SELECT
                });
                res.send(data);
            }catch(error){
                return res.status(500).json({error:'invalid username.'});
            }
        }else{
            return res.status(500).json({error:'invalid key value.'});
        }
    },

    //required as params:
    //key
    //asset name
    profilePicture : async function(req,res){
        if(req.params.key==process.env.API_KEY){
            try{
                res.sendFile(path.resolve('./')+'/assets/profile_pictures/'+req.params.assetName);
            }catch(error){
                return res.status(500).json({error:'invalid asset name.'});
            }
        }else{
            return res.status(500).json({error:'invalid key value.'});
        }
    },

    //required as body:
    //key
    //username
    //question
    //options[]
    //correctOption
    //questionType
    //assetPath *not fix yet*
    addQuestion : async function(req,res){
        //400 -> bad request
        //201 -> data created
        //500 -> internal server error
        var statusCode;
        var message;

        var validation = [
            [true],//username
            [true,true],//question
            [true],//optionA
            [true],//optionB
            [true],//optionC
            [true],//optionD
            [true],//correctAnswer
            [true],//questionType
            [true]//assetPath
        ];
        var validationMessage = [
            "username field must be between 1-30 length",
            [
                "question field must be between 3-100 length",
                "question must be unique"
            ],
            "option A field must be between 1-50 length",
            "option B field must be between 1-50 length",
            "option C field must be between 1-50 length",
            "option D field must be between 1-50 length",
            "correct answer not included in options given",
            "question type must be in 1 or 2",
        ]
        if(req.body.key==process.env.API_KEY){
            //simple validation
            const questiontype = ['1','2'];

            //validation field
            validation[0][0] = validator.isLength(req.body.username,1,30);
            validation[1][0] = validator.isLength(req.body.question,3,100);
            for(var i=0;i<req.body.options.length;i++){
                validation[i+2][0] = validator.isLength(req.body.options[i],1,50);
            }
            validation[6][0] = validator.isIn(req.body.correctOption,req.body.options);
            validation[7][0] = validator.isIn(String(req.body.questionType),questiontype);
            //*
            //validation for asset to be update
            //*

            if(validation.some(row => row.includes(false))){
                statusCode = 400;
                message = "validation error";
            }else{
                //calling sp to create question
                try{
                    const data = await sequelize.query("EXEC SP_AddQuizQuestion :username,:question,"+
                    ":optionA,:optionB,:optionC,:optionD,:correctOption,:questionType,:assetPath", 
                    { 
                        replacements: {
                            username: req.body.username, 
                            question: req.body.question,
                            optionA: req.body.options[0],
                            optionB: req.body.options[1],
                            optionC: req.body.options[2],
                            optionD: req.body.options[3],
                            correctOption: req.body.correctOption,
                            questionType: req.body.questionType,
                            assetPath: (req.body.assetPath) ? req.body.assetPath:null,
                        }, 
                        type: QueryTypes.SELECT 
                    });
                    statusCode = 201;
                    message = "data created successfully";
                }catch(error){
                    statusCode = 500;
                    message = "internal server error";
                    validation[1][1] = false;
                }
            }
        }else{
            statusCode = 400;
            message = "invalid key value";
        }
        return res.status(statusCode).json({
            message : message,
            data:{
                username: (!validation[0][0]) ? validationMessage[0] : '',
                question: [
                    (!validation[1][0]) ? validationMessage[1][0] : '',
                    (!validation[1][1]) ? validationMessage[1][1] : '',
                ],
                optionA: (!validation[2][0]) ? validationMessage[2] : '',
                optionB: (!validation[3][0]) ? validationMessage[3] : '',
                optionC: (!validation[4][0]) ? validationMessage[4] : '',
                optionD: (!validation[5][0]) ? validationMessage[5] : '',
                correctOption: (!validation[6][0]) ? validationMessage[6] : '',
                questionType: (!validation[7][0]) ? validationMessage[7] : '',
            }
        });
    },

    //leaderboard
    //required as body:
    //key
    //will return leaderboard data based on 1 week ago until today
    leaderboard : async function(req,res){
        if(req.body.key == process.env.API_KEY){
            var statusCode;
            var message;
            var responseData;
            try {
                const data = await sequelize.query("EXEC SP_Leaderboard", 
                { 
                    type: QueryTypes.SELECT 
                });
                statusCode = 200;
                message = 'success';
                responseData = data;
            } catch (error) {
                statusCode = 500;
                message = error;
            } 
        }else{
            statusCode = 400;
            message = 'invalid key value.'
        }
        return res.status(statusCode).json({
            message : message,
            data : (responseData) ? responseData : ''
        });
    }
}

module.exports = {mainController};
