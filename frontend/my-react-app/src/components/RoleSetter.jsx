import { useSelector } from "react-redux";
import RequesterHome from "./requesterHome.jsx"
import ReceiverHome from "./receiverHome.jsx"



export default function RoleSetter() {
    const role = useSelector(state => state.role.value)



    return (

        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            {role === "requester" && (<><RequesterHome /></>)}
            {role === "receiver" && (<><ReceiverHome /></>)}
        </div>
    );
}