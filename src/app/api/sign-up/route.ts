import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';
import {sendVerificationEmail} from "@/helpers/sendVerificationEmail";
import {ApiResponse} from "@/types/ApiResponse";

/** SIGN UP */
export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingUserVerifiedByUsername) {
            return Response.json(<ApiResponse>{
                code: 'usernameAlreadyExists',
                success: false,
                message: 'Username is already taken',
            }, {status: 400});
        }

        const existingUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json(<ApiResponse>{
                    code: 'emailAlreadyExists',
                    success: false,
                    message: 'User already exists with this email',
                }, {status: 400});
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
                createdAt: new Date(),
            });
            const savedUser = await newUser.save();
            console.log('registered user ✅', savedUser);
        }

        // send verification email
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
            code: 'registered',
            success: true,
            message: 'User registered successfully. Please verify your email',
        }, {status: 201});
    } catch (error) {
        console.error('Error in registering user', error);
        return Response.json(<ApiResponse>{code: 'unknownError', success: false, message: 'Error registering user', error}, {status: 500});
    }
}
