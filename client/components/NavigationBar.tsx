import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";
import "@/app/styles/globals.css"

export default function NaviagationBar () {
    return(
        <div className="w-full h-full border flex justify-end items-center gap-4">    
            <a href="\home" className="text-2xl">Home</a>
            <a href="\discover" className="text-2xl">Discover</a>
            <a href="\faq" className="text-2xl">FAQ</a>
            <Profile/>
            {/* <LogoutButton/> */}
        </div>
    )
}