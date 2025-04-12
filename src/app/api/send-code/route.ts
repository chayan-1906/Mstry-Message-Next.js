import {sendVerificationEmail} from "@/helpers/sendVerificationEmail";
import {ApiResponse} from "@/types/ApiResponse";
import {generateRandomCode} from "@/lib/utils";

/**
 {
     "username": "pdas9647",
     "email": "padmanabhadas9647@gmail.com"
 }

 {
     "username": "pdas7319",
     "email": "padmanabhadas7319@gmail.com"
 }

 {
    "username": "chayan1906",
    "email": "chayan19062000@gmail.com"
 }

 * */

export async function POST(request: Request) {
    const {email, username} = await request.json();
    const verifyCode = generateRandomCode();
    const emailResponse = await sendVerificationEmail(email, username, verifyCode);
    console.log('verification email response ✅', emailResponse);
    if (!emailResponse.success) {
        return Response.json(<ApiResponse>{
            code: 'emailSendFailed',
            success: false,
            message: emailResponse.message,
        }, {status: 500});
    }

    return Response.json(<ApiResponse>{
        code: 'emailSent',
        success: true,
        message: `Verification email sent successfully! ${email}`,
    }, {status: 200});
}
