const fs = require('fs');
let content = fs.readFileSync('src/components/admin/TiptapEditor.tsx', 'utf-8');

// Add onChange to props interface
content = content.replace(
  'draftKey?: string;', 
  'draftKey?: string;\n  onChange?: (html: string) => void;'
);

// Add onChange to component args
content = content.replace(
  'draftKey = "draft_tiptap_default",', 
  'draftKey = "draft_tiptap_default",\n  onChange,'
);

// Add onUpdate to useEditor config
content = content.replace(
  'content: "",', 
  'content: "",\n    onUpdate: ({ editor }) => {\n      if (onChange) onChange(editor.getHTML());\n    },'
);

fs.writeFileSync('src/components/admin/TiptapEditor.tsx', content);

