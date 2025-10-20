import React from "react";
import { MessagesType } from "../[projectid]/page";

type Props = {
    messages: MessagesType[]
}

function ChatSection({messages}:Props) {
    return <div className="w-96 shadow h-[91vh] p-4">ChatSection</div>;
}

export default ChatSection;
