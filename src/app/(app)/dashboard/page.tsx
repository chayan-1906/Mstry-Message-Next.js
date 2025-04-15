'use client';

import {useCallback, useEffect, useState} from "react";
import {Message} from "@/model/Message";
import {useSession} from "next-auth/react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {acceptMessageSchema} from "@/schemas/acceptMessageSchema";
import axios, {AxiosError} from "axios";
import apis from "@/lib/apis";
import {ApiResponse} from "@/types/ApiResponse";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Separator} from "@/components/ui/separator";
import {Loader2, RefreshCcw} from "lucide-react";
import MessageCard from "@/components/MessageCard";
import {User} from "next-auth";

function DashboardPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

    const {data: session} = useSession();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema),
    });
    const {register, watch, setValue} = form;

    const acceptMessages = watch('acceptMessages');

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId));
    }

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post(apis.acceptMessageApi(), {
                acceptMessages: !acceptMessages,
            });
            setValue('acceptMessages', !acceptMessages);
            toast(response.data.message);
        } catch (error: any) {
            console.error('Error inside handleSwitchChange', error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast('Error', {description: axiosError.response?.data.message ?? 'Failed to change switch'});
        }
    }

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const response = await axios.get<ApiResponse>(apis.acceptMessageApi());
            setValue('acceptMessages', response.data.isAcceptingMessages ?? false);
        } catch (error: any) {
            console.error('Error inside fetchAcceptMessage', error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast('Error', {description: axiosError.response?.data.message ?? 'Failed to fetch message settings'});
        } finally {
            setIsSwitchLoading(false);
        }
    }, [setValue]);

    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(false);
        setIsSwitchLoading(false);
        try {
            const response = await axios.get<ApiResponse>(apis.getMessagesApi());
            setMessages(response.data.messages || []);
            if (refresh) {
                toast('Refreshed Messages', {description: 'Showing latest messages'});
            }
        } catch (error: any) {
            console.error('Error inside fetchMessages', error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast('Error', {description: axiosError.response?.data.message ?? 'Failed to fetch messages'});
        } finally {
            setIsLoading(false);
            setIsSwitchLoading(false);
        }
    }, [setIsLoading, setMessages]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(profileUrl);
        toast('URL Copied!', {description: 'Profile URL copied!'});
    }

    useEffect(() => {
        if (!session || !session.user) return;
        fetchMessages();
        fetchAcceptMessage();
    }, [session, setValue, fetchAcceptMessage, fetchMessages]);

    if (!session || !session.user) {
        return (
            <div>Please Login</div>
        );
    }

    const {username} = session?.user as User;
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`;

    return (
        <div className={'my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl'}>
            <h1 className={'text-4xl font-bold mb-4'}>User Dashboard</h1>

            <div className={'mb-4'}>
                <h2 className={'mb-2 text-lg font-semibold'}>Copy Your Unique Link</h2>{' '}
                <div className={'flex items-center'}>
                    <input type={'text'} value={profileUrl} disabled className={'input input-bordered w-full p-2 mr-2'}/>
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch {...register('acceptMessages')} checked={acceptMessages} onCheckedChange={handleSwitchChange} disabled={isSwitchLoading}/>
                <span className={'ml-2'}>Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
            </div>
            <Separator/>

            <Button className={'mt-4'} variant={'outline'} onClick={async (e) => (e.preventDefault(), await fetchMessages(true))}>
                {isLoading ? (
                    <Loader2 className={'size-4 animate-spin'}/>
                ) : (
                    <RefreshCcw className={'size-4'}/>
                )}
            </Button>
            <div className={'mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'}>
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard key={index} message={message} onMessageDelete={handleDeleteMessage}/>
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
