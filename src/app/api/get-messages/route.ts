import dbConnect from "@/lib/dbConnect";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {ApiResponse} from "@/types/ApiResponse";
import mongoose from "mongoose";
import UserModel from "@/model/User";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const sessionUser: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(<ApiResponse>{
            code: 'unAuthenticated',
            success: false,
            message: 'Not Authenticated',
        }, {status: 401});
    }

    const userId = new mongoose.Types.ObjectId(sessionUser._id);

    try {
        const user = await UserModel.aggregate([
            {$match: {_id: userId}},
            {$project: {messages: 1}}, // Optional: limit fields
            {$unwind: {path: '$messages', preserveNullAndEmptyArrays: true}},
            {$sort: {'messages.createdAt': -1}},
            {$group: {_id: '$_id', messages: {$push: '$messages'}}},
        ]).exec();

        if (!user || user.length === 0) {
            return Response.json(<ApiResponse>{
                code: 'userNotFound',
                success: false,
                message: 'User not found',
            }, {status: 404});
        }

        return Response.json(<ApiResponse>{
            code: 'messagesRetrieved',
            success: true,
            messages: user[0].messages,
        }, {status: 200});
    } catch (error: any) {
        console.error('Failed to get user status to accept messages', error);
        return Response.json(<ApiResponse>{
            code: 'unknownError',
            success: false,
            message: 'Error in getting message acceptance status',
            error,
        }, {status: 500});
    }
}
