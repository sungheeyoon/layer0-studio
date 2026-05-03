'use client';

import { useState } from 'react';
import { Template } from '@/domain/entities/template.entity';
import TemplateListPanel from './TemplateListPanel';
import TemplateEditorPanel from './TemplateEditorPanel';

interface TemplatesClientWrapperProps {
  templates: Template[];
  canPublish?: boolean;
}

export default function TemplatesClientWrapper({
  templates,
  canPublish = false,
}: TemplatesClientWrapperProps) {
  const [editingTemplate, setEditingTemplate] = useState<
    Template | undefined
  >(undefined);

  return (
    <>
      <TemplateListPanel
        templates={templates}
        canPublish={canPublish}
        onEdit={(t) => setEditingTemplate(t)}
        onDelete={(id) => {
          if (editingTemplate?.id === id) {
            setEditingTemplate(undefined);
          }
        }}
      />
      <TemplateEditorPanel
        key={editingTemplate?.id ?? 'new'}
        template={editingTemplate}
        onDone={() => setEditingTemplate(undefined)}
      />
    </>
  );
}
