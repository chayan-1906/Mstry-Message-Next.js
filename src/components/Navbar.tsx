'use client';

import {signOut, useSession} from "next-auth/react";
import {User} from "next-auth";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import routes from "@/lib/routes";

function Navbar() {
    const {data: session} = useSession();
    const user: User = session?.user as User;

    return (
        <nav className={'p-4 md:p-6 shadow-md'}>
            <div className={'container flex flex-col md:flex-row justify-between items-center mx-auto'}>
                <Link href={'#'}>Mstry Message</Link>
                {
                    session ? (
                        <>
                            <span className={'mr-4'}>Welcome, {user?.username || user?.email}</span>
                            <Button className={'cursor-pointer'} onClick={() => signOut()}>Sign out</Button>
                        </>
                    ) : (
                        <Link href={routes.signInPath}>
                            <Button className={'w-full md:m-auto cursor-pointer'}>Sign In</Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    );
}

export default Navbar;
