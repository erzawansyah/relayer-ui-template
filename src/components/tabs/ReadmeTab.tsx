import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReadmeTabProps {
    content: string | null;
}

export default function ReadmeTab({ content }: ReadmeTabProps) {
    if (!content) {
        return (
            <div className="text-center py-8 text-fg-muted">
                <p>No README available for this contract.</p>
            </div>
        );
    }

    return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ ...props }) => (
                        <h1 className="text-2xl font-bold mb-4 text-fg border-b border-surface-2 pb-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                        <h2 className="text-xl font-semibold mb-3 mt-6 text-fg" {...props} />
                    ),
                    h3: ({ ...props }) => (
                        <h3 className="text-lg font-semibold mb-2 mt-4 text-fg" {...props} />
                    ),
                    p: ({ ...props }) => (
                        <p className="mb-3 text-fg-muted leading-relaxed" {...props} />
                    ),
                    ul: ({ ...props }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1 text-fg-muted" {...props} />
                    ),
                    ol: ({ ...props }) => (
                        <ol className="list-decimal list-inside mb-3 space-y-1 text-fg-muted" {...props} />
                    ),
                    li: ({ ...props }) => <li className="ml-4" {...props} />,
                    code: ({ className, children, ...props }) => {
                        const inline = !className;
                        return inline ? (
                            <code className="bg-surface-2 px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-surface-2 p-4 rounded-lg text-sm font-mono overflow-x-auto text-fg" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ ...props }) => (
                        <pre className="mb-4 overflow-hidden rounded-lg" {...props} />
                    ),
                    blockquote: ({ ...props }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-fg-muted my-4" {...props} />
                    ),
                    strong: ({ ...props }) => (
                        <strong className="font-semibold text-fg" {...props} />
                    ),
                    hr: ({ ...props }) => (
                        <hr className="my-6 border-surface-2" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
