import mongoose from "mongoose";
const chatCollection = "messages";
const chatSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },

})

export const chatModel = mongoose.model(chatCollection, chatSchema);
  