'use client';

import {useParams, useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {verifySchema} from "@/schemas/verifySchema";
import {zodResolver} from "@hookform/resolvers/zod";
import axios, {AxiosError} from "axios";
import apis from "@/lib/apis";
import {toast} from "sonner";
import routes from "@/lib/routes";
import {ApiResponse} from "@/types/ApiResponse";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

function VerifyAccountPage() {
    const param = useParams<{ username: string; }>();
    const router = useRouter();

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    });

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post(apis.verifyCodeApi(), {
                username: param.username,
                code: data.code,
            });
            toast('Success', {description: response.data.message});
            router.replace(routes.signInPath);
        } catch (error: any) {
            console.error('Error in verifyCode', error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message ?? 'Error verifying code';
            toast('Verify failed', {description: errorMessage, className: 'bg-red-500'});
        }
    }

    return (
        <div className={'flex justify-center items-center min-h-screen bg-gray-100'}>
            <div className={'w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'}>
                <div className={'text-center'}>
                    <h1 className={'text-4xl lg:text-5xl mb-6 font-extrabold tracking-tight'}>Verify Your Account</h1>
                    <p className={'mb-4'}>Enter the verification code sent to your email</p>
                </div>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-6'}>
                            <FormField control={form.control} name={'code'}
                                       render={({field}) => (
                                           <FormItem>
                                               <FormLabel>Verification Code</FormLabel>
                                               <FormControl>
                                                   <Input {...field} value={field.value ?? ''} type={'number'} autoFocus placeholder={'Enter 6-digit verification code...'}
                                                          onChange={(e) => field.onChange(e)}/>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default VerifyAccountPage;
