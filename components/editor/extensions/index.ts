import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import { FontSize } from './fontSize'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import AutoJoiner from 'tiptap-extension-auto-joiner'

import { Callout } from './callout'
import { Details, DetailsSummary, DetailsContent } from './toggle'
import { ColumnList, Column } from './columns'
import { MathBlock } from './mathBlock'
import { TableOfContents } from './tableOfContents'
import { AudioBlock, VideoBlock, EmbedBlock, FileBlock, BookmarkBlock } from './media'
import { ResizableImage } from './image'
import { SlashCommand } from '../slash'
import { EmojiCommand } from '../emoji'

/** Node names that the drag handle should treat as draggable top-level blocks. */
const DRAGGABLE_NODES = [
  'callout', 'details', 'tableOfContents', 'mathBlock', 'audio', 'video', 'embed', 'fileBlock', 'bookmark', 'image', 'columnList',
]

export function buildEditorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      codeBlock: { HTMLAttributes: { class: 'code-block' } },
    }),
    Placeholder.configure({
      includeChildren: true,
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') return 'Heading'
        if (node.type.name === 'detailsSummary') return 'Toggle'
        return placeholder
      },
    }),
    Underline,
    Highlight.configure({ multicolor: true }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    ResizableImage.configure({ inline: false, allowBase64: false }),
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true, lastColumnResizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    // Custom Notion-style blocks
    Callout,
    Details, DetailsSummary, DetailsContent,
    ColumnList, Column,
    MathBlock,
    TableOfContents,
    AudioBlock, VideoBlock, EmbedBlock, FileBlock, BookmarkBlock,
    // Menus
    SlashCommand,
    EmojiCommand,
    // Block gutter (drag + reorder)
    GlobalDragHandle.configure({ dragHandleWidth: 28, scrollTreshold: 100, customNodes: DRAGGABLE_NODES }),
    AutoJoiner,
  ]
}
