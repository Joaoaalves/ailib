import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type MarkdownRendererProps = {
    children: string;
};

export function MarkdownRenderer({
    children: markdown,
}: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            className="markdown"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline && match ? (
                        <div className="grid grid-rows-[36px_1fr] grid-cols-1">
                            <span className="text-white z-50 bg-black p-2 uppercase font-bold">
                                {match[1]}
                            </span>
                            <SyntaxHighlighter
                                style={materialDark}
                                PreTag="div"
                                language={match[1]}
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
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
