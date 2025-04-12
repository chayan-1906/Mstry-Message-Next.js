import {Request} from "next/dist/compiled/@edge-runtime/primitives";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {ApiResponse} from "@/types/ApiResponse";

/** VERIFY CODE */
export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, code} = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({username: decodedUsername});
        if (!user) {
            return Response.json(<ApiResponse>{
                code: 'userNotFound',
                success: false,
                message: 'User not found',
            }, {status: 404});
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if (user.isVerified) {
            return Response.json(<ApiResponse>{
                code: 'alreadyVerified',
                success: false,
                message: 'User already verified',
            }, {status: 400});
        } else if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json(<ApiResponse>{
                code: 'verified',
                success: true,
                message: 'Account verified successfully',
            }, {status: 200});
        } else {
            return Response.json(<ApiResponse>{
                code: 'invalidExpiredCode',
                success: false,
                message: 'Code is either invalid or expired',
            }, {status: 400});
        }
    } catch (error: any) {
        console.error('Error verifying code', error);
        return Response.json(<ApiResponse>{
            code: 'unknownError',
            success: false,
            message: 'Error verifying code',
            error,
        }, {status: 500});
    }
}
