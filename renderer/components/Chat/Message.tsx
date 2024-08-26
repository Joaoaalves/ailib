import type { IMessage } from "shared/types/conversation";
import { AiOutlineOpenAI, AiOutlineUser } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Message({ message }: { message: IMessage }) {
    return (
        <div
            className={`flex gap-x-4 ${
                message.role == "user" ? "ms-auto flex-row-reverse" : "me-auto"
            }`}
        >
            <div className="bg-primary w-12 h-12 rounded-full grid place-items-center">
                {message.role == "user" ? (
                    <AiOutlineUser className="text-white text-4xl" />
                ) : (
                    <AiOutlineOpenAI className="text-white text-4xl" />
                )}
            </div>
            <div
                className={`text-white p-6 px-4 bg-container ${
                    message.role == "user"
                        ? "rounded-s-2xl rounded-ee-2xl"
                        : "rounded-e-2xl rounded-es-2xl"
                } shadow-primary w-[700px] mt-10`}
            >
                <MarkdownRenderer>
                    {message.content}
                </MarkdownRenderer>
            </div>
        </div>
    );
}

type MarkdownRendererProps = {
    children: string;
  };
  
function MarkdownRenderer({ children: markdown }: MarkdownRendererProps) {
    return (
      <ReactMarkdown
        className="markdown"
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
  
            return !inline && match ? (
                <div className="grid grid-rows-[36px_1fr] grid-cols-1">
                    <span className="text-white z-50 bg-black p-2 uppercase font-bold">{match[1]}</span>
                    <SyntaxHighlighter style={materialDark} PreTag="div" language={match[1]} {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    );
  }