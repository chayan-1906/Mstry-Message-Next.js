import {z} from "zod";
import {usernameValidation} from "@/schemas/signUpSchema";
import {Request} from "next/dist/compiled/@edge-runtime/primitives";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {ApiResponse} from "@/types/ApiResponse";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

/** CHECK USERNAME UNIQUE */
export async function GET(request: Request) {
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username'),
        }

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log(result);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(<ApiResponse>{
                code: 'invalidQuery',
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters',
            }, {status: 400});
        }

        const {username} = result.data;
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});
        if (existingVerifiedUser) {
            return Response.json(<ApiResponse>{
                code: 'usernameAlreadyExists',
                success: false,
                message: 'Username is already taken',
            }, {status: 400});
        }

        return Response.json(<ApiResponse>{
            code: 'usernameUnique',
            success: true,
            message: 'Username is unique',
        }, {status: 200});
    } catch (error: any) {
        console.error('Error checking username', error);
        return Response.json(<ApiResponse>{
            code: 'unknownError',
            success: false,
            message: 'Error checking username',
            error,
        }, {status: 500});
    }
}
