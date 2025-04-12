import {Message} from "@/model/Message";

export interface ApiResponse {
    code: string;
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>;
    error?: any;   // for internal use only
}
