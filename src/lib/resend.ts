import {Resend} from "resend";
import {RESEND_API_KEY} from "@/lib/config";

export const resend = new Resend(RESEND_API_KEY);
