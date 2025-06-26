import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  role: string;
  content: string;
}

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";

  const urlRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const links: { name: string; url: string }[] = [];
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    links.push({ name: match[1], url: match[2] });
  }

  const withoutLinks = content.replace(urlRegex, "");

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-3xl ${isUser ? 'order-first' : ''}`}>
        
        <div className={`text-xs font-medium text-gray-500 mb-1 ${
          isUser ? 'text-right mr-4' : 'text-left ml-1'
        }`}>
          {isUser ? "You" : "AskForge"}
        </div>
        
        
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white ml-12' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown 
              components={{
                
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className={`px-1 py-0.5 rounded text-xs ${
                    isUser ? 'bg-blue-500 bg-opacity-50' : 'bg-gray-100'
                  }`}>
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className={`p-2 rounded mt-2 mb-2 text-xs overflow-x-auto ${
                    isUser ? 'bg-blue-500 bg-opacity-50' : 'bg-gray-100'
                  }`}>
                    {children}
                  </pre>
                ),
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              }}
            >
              {withoutLinks.trim()}
            </ReactMarkdown>
          </div>
          
          
          {links.length > 0 && (
            <div className={`mt-3 pt-3 border-t text-xs ${
              isUser 
                ? 'border-blue-500 border-opacity-30' 
                : 'border-gray-200'
            }`}>
              <div className={`font-medium mb-2 ${
                isUser ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Sources:
              </div>
              <ul className="space-y-1">
                {links.map((link, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline break-all ${
                        isUser 
                          ? 'text-blue-100 hover:text-white' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
