'use client';

import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useCallback, useEffect, useState} from "react";
import axios, {AxiosError} from "axios";
import apis from "@/lib/apis";
import {ApiResponse} from "@/types/ApiResponse";
import {useDebounceCallback} from "usehooks-ts";
import {signUpSchema} from "@/schemas/signUpSchema";
import {toast} from "sonner";
import routes from "@/lib/routes";
import {Form, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Loader2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Link from "next/link";

function SignUpPage() {
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debouncedUsername = useDebounceCallback(setUsername, 300);
    const router = useRouter();

    useEffect(() => {
        const checkUserUniqueness = async () => {
            if (username) {
                setIsCheckingUsername(true);
                setUsernameMessage('');
                try {
                    const response = await axios.get(apis.checkUniqueUsernameApi(username));
                    setUsernameMessage(response.data.message);
                } catch (error: any) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message ?? 'Error checking username');
                } finally {
                    setIsCheckingUsername(false);
                }
            }
        }

        checkUserUniqueness();
    }, [username]);

    const onSubmit = useCallback(async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>(apis.signUpApi(), data);
            toast('Success', {description: response.data.message});
            router.replace(routes.verifyPath(username));
        } catch (error: any) {
            console.error('Error in user signup', error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message ?? 'Error signing up';
            setUsernameMessage(errorMessage);
            toast('Sign Up failed', {description: errorMessage, className: 'bg-red-500'});
        } finally {
            setIsSubmitting(false);
        }
    }, [router, username]);

    return (
        <div className={'flex justify-center items-center min-h-screen bg-gray-100'}>
            <div className={'w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'}>
                <div className={'text-center'}>
                    <h1 className={'text-4xl lg:text-5xl mb-6 font-extrabold tracking-tight'}>Join Mstry Message</h1>
                    <p className={'mb-4'}>Sign up to start your anonymous adventure</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-6'}>
                        {/** username */}
                        <FormField
                            name={'username'}
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            debouncedUsername(e.target.value);
                                        }}
                                    />
                                    {isCheckingUsername && <Loader2 className={'animate-spin'}/>}
                                    {!isCheckingUsername && usernameMessage && (
                                        <p className={`text-sm ${usernameMessage === 'Username is unique' ? 'text-green-500' : 'text-red-500'}`}>
                                            {usernameMessage}
                                        </p>
                                    )}
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {/** email */}
                        <FormField
                            name={'email'}
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} name={'email'}/>
                                    <p className={'text-gray-400 text-sm'}>We will send you a verification code</p>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {/** password */}
                        <FormField
                            name={'password'}
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input type={'password'} {...field} name={'password'}/>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button type={'submit'} className={'w-full'} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className={'mr-2 h-4 w-4 animate-spin'}/> Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </Form>

                <div className={'text-center mt-4'}>
                    <p>
                        Already a member?{' '}
                        <Link href={routes.signInPath} className={'text-blue-600 hover:text-blue-800'}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;
