"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface AIChatContextType {
    messages: ChatMessage[];
    loading: boolean;

    addMessage: (
        role: "user" | "assistant",
        content: string
    ) => void;

    setLoading: (loading: boolean) => void;

    clearChat: () => void;
}

const AIChatContext =
    createContext<AIChatContextType | null>(null);


export function AIChatProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [messages, setMessages] =
        useState<ChatMessage[]>([]);

    const [loading, setLoading] =
        useState(false);


    function addMessage(
        role: "user" | "assistant",
        content: string
    ) {

        const message: ChatMessage = {
            id:
                `${Date.now()}-${Math.random()}`,

            role,

            content,
        };

        setMessages((previous) => [
            ...previous,
            message,
        ]);
    }


    function clearChat() {

        setMessages([]);

    }


    return (

        <AIChatContext.Provider
            value={{
                messages,
                loading,
                addMessage,
                setLoading,
                clearChat,
            }}
        >

            {children}

        </AIChatContext.Provider>

    );

}


export function useAIChat() {

    const context =
        useContext(AIChatContext);

    if (!context) {

        throw new Error(
            "AIChatProvider missing."
        );

    }

    return context;

}