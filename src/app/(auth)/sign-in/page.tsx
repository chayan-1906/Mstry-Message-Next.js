'use client';

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCallback} from "react";
import {useRouter} from "next/navigation";
import routes from "@/lib/routes";
import {Form, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {signInSchema} from "@/schemas/signInSchema";
import {signIn} from "next-auth/react";
import {toast} from "sonner";

function SignInPage() {
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    const router = useRouter();

    const onSubmit = useCallback(async (data: z.infer<typeof signInSchema>) => {
        const signInResult = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
        });
        if (signInResult?.error) {
            if (signInResult.error === 'CredentialsSignin') {
                toast('Sign In failed', {description: 'Incorrect username or password'});
            } else {
                toast('Error', {description: signInResult.error});
            }
        } else {
            toast('Sign in successful!');
        }
        console.log(signInResult);

        if (signInResult?.url) {
            router.replace(routes.dashboardPath);
        }
    }, [router]);

    return (
        <div className={'flex justify-center items-center min-h-screen bg-gray-100'}>
            <div className={'w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'}>
                <div className={'text-center'}>
                    <h1 className={'text-4xl lg:text-5xl mb-6 font-extrabold tracking-tight'}>Welcome Back to True Feedback</h1>
                    <p className={'mb-4'}>Sign in to continue your secret conversations</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-6'}>
                        {/** identifier */}
                        <FormField
                            name={'identifier'}
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Username/Email</FormLabel>
                                    <Input {...field} placeholder={'Enter your username/email address...'} onChange={(e) => field.onChange(e)}/>
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
                                    <Input {...field} placeholder={'Enter your password...'} type={'password'} name={'password'}/>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button type={'submit'} className={'w-full'}>Sign In</Button>
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

export default SignInPage;
