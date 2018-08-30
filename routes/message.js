const express = require('express');
const router = express.Router();
const passport = require('passport');
const {Conversation , Messages, User} = require('../sequelize');

// get chat-room conversation
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
    Conversation.findOne({ where:{name: "chat-room"}}).then(conversation => {
        // response.success = false;
        // response.msg = "There was an error on getting the conversation";
        // res.json(response);
        if (conversation == null) {
            let chatRoom = {name: "chat-room"};
            Conversation.create(chatRoom).then(conversation => {
                res.json(conversation)
            });
            // Conversation.create(chatRoom, (err, conv) => {
            //     if (err) return callback("There was an error on getting the conversation");
            //     return callback(null, conv);
            // });
        } else {

            Messages.findAll({where:{conversationId: conversation.id}}).then(messages => {
                let conversationObj = conversation;
                response.messages = messages;
                response.msg = "Conversation retrieved successfuly";
                response.conversation = conversationObj;
                res.json(response);
            });
        }



  // Conversation.getChatRoom((err, chatRoom) => {
  //   if (err || chatRoom == null) {
  //     response.success = false;
  //     response.msg = "There was an error on getting the conversation";
  //     res.json(response);
  //   } else {
  //     response.msg = "Conversation retrieved successfuly";
  //     response.conversation = chatRoom;
  //     res.json(response);
  //   }
  // });
});
});

// get conversation
router.get('/:name1/:name2', passport.authenticate("jwt", {session: false}), (req, res, next) => {
    let response = {success: true};
    getConversationByName(req.params.name1, req.params.name2).then(conversations => {
        console.log(conversations);

        if(!conversations) {
            response.success = false;
            response.msg = "The user could not be found";
        }

        if(conversations === null) {
            response.success = false;
            response.msg = "No Conversation Found";
        } else {
            response.success = true;
            response.msg = "Conversation retrieved Successfully";
            response.messages = conversations;
        }

        res.json(response);
    });
});

function getConversationByName(participant1, participant2) {
    let combo1 = "" + participant1 + "-" + participant2;
    let combo2 = "" + participant2 + "-" + participant1;
    return Conversation.findOne({where:{name: combo1}}).then(conversation1 => {
        if (conversation1 == null) {
            return Conversation.findOne({where:{name: combo2}}).then(conversation2 => {
                if (conversation2 == null) {
                    getUserByUsername(participant1).then(user1 => {
                        if (user1 == null) {
                            return false;
                        }

                        getUserByUsername(participant2).then(user2 => {

                            if (user2 == null) {
                                return false;
                            }

                            let participantsUser1 = {
                                username: user1.username,
                                id: user1.id
                            };

                            let participantsUser2 = {
                                username: user2.username,
                                id: user2.id
                            };

                            let participants = "[{username:"+user1.username+",id:"+user1.id+"}";
                                participants += "{username:"+user2.username+",id:"+user2.id+"}]";

                            let newConv = {
                                participants: participants,
                                name: "" + participantsUser1.username + "-" + participantsUser2.username
                            };
                            //creating new conversation
                            Conversation.create(newConv);
                        });
                    });

                } else {
                    return getMessagesByConv(conversation2.id);
                }
            });
        } else {

            return getMessagesByConv(conversation1.id);


        }
    });
}

function getUserByUsername(username) {
    let query = {username: username};
    return User.findOne({ where: query});
}

function getMessagesByConv(conversationID){
    return Messages.findAll({raw: true,where:{conversationId: conversationID}});
}




module.exports = router;
