import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {ApiResponse} from "@/types/ApiResponse";
import {Message} from "@/model/Message";

export async function POST(request: Request) {
    await dbConnect();

    const {username, content} = await request.json();

    try {
        const user = await UserModel.findOne({username});
        if (!user) {
            return Response.json(<ApiResponse>{
                code: 'userNotFound',
                success: false,
                message: 'User not found',
            }, {status: 404});
        }

        // is user accepting messages
        if (user.isAcceptingMessage) {
            return Response.json(<ApiResponse>{
                code: 'messageAccessForbidden',
                success: false,
                message: 'User is not accepting the messages',
            }, {status: 403});
        }

        const newMessage = {content, createdAt: new Date()};
        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json(<ApiResponse>{
            code: 'messageSent',
            success: true,
            message: 'Message sent successfully',
        }, {status: 200});
    } catch (error: any) {
        console.error('Failed to send message', error);
        return Response.json(<ApiResponse>{
            code: 'unknownError',
            success: false,
            message: 'Error in sending message',
            error,
        }, {status: 500});
    }
}