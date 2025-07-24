import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Link2,
  Image,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextFormat = (format: string) => {
    // For now, we'll use a simple textarea approach
    // In a full implementation, you'd integrate with a rich text library
    const textarea = document.getElementById('rich-text-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = selectedText;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = end + 4;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = end + 2;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        newCursorPos = end + 2;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        newCursorPos = end + 2;
        break;
      case 'numbered-list':
        formattedText = `1. ${selectedText}`;
        newCursorPos = end + 3;
        break;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={cn("border border-slate-200 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className={cn(
        "flex items-center space-x-1 px-3 py-2 border-b border-slate-200 bg-slate-50 transition-colors",
        isFocused && "border-primary/20 bg-primary/5"
      )}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('bold')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('italic')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('quote')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('list')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('numbered-list')}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Link2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Image className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Text Area */}
      <Textarea
        id="rich-text-area"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[120px]"
        rows={5}
      />
    </div>
  );
}
