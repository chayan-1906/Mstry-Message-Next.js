import dbConnect from "@/lib/dbConnect";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {ApiResponse} from "@/types/ApiResponse";
import UserModel from "@/model/User";

export async function DELETE(request: Request, {params}: { params: { messageId: string; } }) {
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

    const {messageId} = params || {};

    try {
        const updatedUser = await UserModel.updateOne(
            {_id: user._id},
            {$pull: {messages: {_id: messageId}}}
        );
        if (updatedUser.modifiedCount === 0) {
            return Response.json(<ApiResponse>{
                code: 'messageNotFound',
                success: false,
                message: 'Message not found',
            }, {status: 404});
        }

        return Response.json(<ApiResponse>{
            code: 'deleted',
            success: true,
            message: 'Message deleted successfully',
        }, {status: 200});
    } catch (error: any) {
        console.error('Failed to delete message', error);
        return Response.json(<ApiResponse>{
            code: 'unknownError',
            success: false,
            message: 'Error in deleting message',
            error,
        }, {status: 500});
    }
}
