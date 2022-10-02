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
            const spList = ['SP_GetQuizDemo','SP_GetQuizGeneral','SP_GetQuizTele'];
            try{
                const data = await sequelize.query("EXEC "+spList[parseInt(req.body.userTypeId)-1]);
                res.send(data);
            }catch(error){
                return res.status(500).json({error:'invalid userTypeId.'});
            }
        }else{
            return res.status(500).json({error:'invalid key value.'});
        }
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
    //...
    addQuestion : async function(req,res){
        if(req.body.key==process.env.API_KEY){
            const validation = [true,true,true,true,true,true,true];
            const questiontype = [1,2];
            try{
                //validation field
                validation[0] = validator.isLength(req.body.username,[{min:0,max:30}]);
                validation[1] = validator.isLength(req.body.question,[{min:0,max:100}]);
                for(var i=0;i<req.body.option.length;i++){
                    validation[i+2] = validator.isLength(req.body.option[i],[{min:0,max:50}]);
                }
                validation[6] = validator.isIn(req.body.questiontype,questiontype);
                console.log(validation);
            }catch(error){
                return res.status(500).json({error:'invalid asset name.'});
            }
        }else{
            return res.status(500).json({error:'invalid key value.'});
        }

        //console.log('hit');
        //console.log(req.body);
        //res.send('hello');
    }
}

module.exports = {mainController};
