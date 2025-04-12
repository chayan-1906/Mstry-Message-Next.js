import dbConnect from "@/lib/dbConnect";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {ApiResponse} from "@/types/ApiResponse";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(<ApiResponse>{
            code: 'unAuthenticated',
            success: false,
            message: 'Not Authenticated',
        }, {status: 401});
    }

    const userId = user._id;
    const {acceptMessages} = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId,
            {isAcceptingMessage: acceptMessages},
            {new: true},
        );
        if (!updatedUser) {
            return Response.json(<ApiResponse>{
                code: 'updateUserFailed',
                success: false,
                message: 'Failed to update user status to accept messages',
            }, {status: 401});
        }

        return Response.json(<ApiResponse>{
            code: 'updatedUser',
            success: true,
            message: 'Message acceptance status updated successfully',
            updatedUser,
        }, {status: 200});
    } catch (error: any) {
        console.error('Failed to update user status to accept messages', error);
        return Response.json(<ApiResponse>{
            code: 'unknownError',
            success: false,
            message: 'Failed to update user status to accept messages',
            error,
        }, {status: 500});
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(<ApiResponse>{
            code: 'unAuthenticated',
            success: false,
            message: 'Not Authenticated',
        }, {status: 401});
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json(<ApiResponse>{
                code: 'userNotFound',
                success: false,
                message: 'User not found',
            }, {status: 404});
        }

        return Response.json(<ApiResponse>{
            code: 'messageAccessFetched',
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage,
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
