import {ApiResponse} from "@/types/ApiResponse";
import {resend} from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mstry Message | Verification code',
            react: VerificationEmail({username, otp: verifyCode}),
        });
        return {success: true, message: 'Verification email sent successfully!'};
    } catch (error) {
        console.error('Error in sendingVerificationEmail', error);
        return {success: false, message: 'Failed to send verification email!'};
    }
}
