const socketIO = require("socket.io");
const socketIOJwt = require("socketio-jwt");
const { Conversation } = require("./models/conversation");
const Message = require("./models/messages").Message;
const { User } = require("./models/user");
const config = require("config");

const socketServer = (server) => {
  try {
    const io = socketIO(server);

    const nameSpace = io.of("/chat");
    nameSpace.on(
      "connection",
      socketIOJwt.authorize({
        secret: config.get("jwtPrivateKey"),
      })
    );
    nameSpace.on("authenticated", async (socket) => {
      console.log("successfuly authenticated");
      const senderID = socket.decoded_token._id;
      console.log(senderID);
      //console.log(socket);

      await socket.join(`user ${senderID}`);

      socket.on("private", async (data) => {
        console.log("We are at private event");
        if (!data.content && !data.attachment) return;
        const senderID = socket.decoded_token._id;

        let conversation = await Conversation.findOne({
          $or: [{ users: [senderID, data.to] }, { users: [data.to, senderID] }],
        });

        //Create a conversation if there isn't
        if (!conversation) {
          conversation = await new Conversation({
            users: [senderID, data.to],
          });
          await conversation.save();
        }
        console.log(conversation);

        //saving messages to the Database
              
        let sentMessage = await new Message({
            user: senderID,
            content: data.content,
            attachment: data.attachment,
            conversation: conversation._id,
          });
          await sentMessage.save();
        
          console.log(sentMessage._id)
        conversation.lastMessage = await sentMessage._id;
        await conversation.save();
        console.log("CHECK POINT WOOHOOO..");
        nameSpace.to(`user ${data.to}`).emit("new message", {
          conversation,
          message: data,
        });

        // //Finding the conversation
        // // let conversation = await Conversation.findOne({
        // //   $or: [{ users: [senderID, data.to] }, { users: [data.to,senderID] }],
        // // });

        // // //Create a conversation if there isn't
        // // if (!conversation) {
        // //   conversation = await new Conversation({
        // //     users: [senderID, data.to],
        // //   });
        // //   await conversation.save();
        // // }
      });
    });
    return io;
  } catch (error) {
    console.log("error...We are at catch");
  }
};
exports.socketServer = socketServer;