import React from "react";
import Navbar from "@/components/Navbar";

function Layout({children}: { children: React.ReactNode; }) {
    return (
        <div className={'flex flex-col min-h-screen'}>
            <Navbar/>
            {children}
        </div>
    );
}

export default Layout;
