'use client';

import { useState } from 'react';
import { Template } from '@/domain/entities/template.entity';
import TemplateListPanel from './TemplateListPanel';
import TemplateEditorPanel from './TemplateEditorPanel';

interface TemplatesClientWrapperProps {
  templates: Template[];
}

export default function TemplatesClientWrapper({
  templates,
}: TemplatesClientWrapperProps) {
  const [editingTemplate, setEditingTemplate] = useState<
    Template | undefined
  >(undefined);

  return (
    <>
      <TemplateListPanel
        templates={templates}
        onEdit={(t) => setEditingTemplate(t)}
        onDelete={(id) => {
          if (editingTemplate?.id === id) {
            setEditingTemplate(undefined);
          }
        }}
      />
      <TemplateEditorPanel
        template={editingTemplate}
        onDone={() => setEditingTemplate(undefined)}
      />
    </>
  );
}
