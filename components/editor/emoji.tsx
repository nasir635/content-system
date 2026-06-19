'use client'
import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import tippy, { type Instance } from 'tippy.js'

interface Emoji { e: string; n: string }
const EMOJIS: Emoji[] = [
  { e: '😀', n: 'grin smile happy' }, { e: '😁', n: 'beam smile' }, { e: '😂', n: 'joy laugh cry' },
  { e: '🤣', n: 'rofl laugh' }, { e: '😅', n: 'sweat smile' }, { e: '😊', n: 'blush smile' },
  { e: '😍', n: 'heart eyes love' }, { e: '😘', n: 'kiss' }, { e: '😎', n: 'cool sunglasses' },
  { e: '🤔', n: 'thinking hmm' }, { e: '🙂', n: 'slight smile' }, { e: '😉', n: 'wink' },
  { e: '😴', n: 'sleep tired' }, { e: '😭', n: 'sob cry' }, { e: '😡', n: 'angry mad rage' },
  { e: '🥳', n: 'party celebrate' }, { e: '🤯', n: 'mind blown' }, { e: '😱', n: 'scream shock' },
  { e: '😇', n: 'angel innocent' }, { e: '🤫', n: 'hush quiet shh' }, { e: '🙃', n: 'upside down' },
  { e: '👍', n: 'thumbs up like yes' }, { e: '👎', n: 'thumbs down no' }, { e: '👏', n: 'clap applause' },
  { e: '🙏', n: 'pray thanks please' }, { e: '💪', n: 'muscle strong flex' }, { e: '👋', n: 'wave hi hello' },
  { e: '🤝', n: 'handshake deal' }, { e: '✌️', n: 'peace victory' }, { e: '🤞', n: 'fingers crossed luck' },
  { e: '👀', n: 'eyes look' }, { e: '🫶', n: 'heart hands love' }, { e: '🤙', n: 'call shaka' },
  { e: '❤️', n: 'heart love red' }, { e: '🧡', n: 'orange heart' }, { e: '💛', n: 'yellow heart' },
  { e: '💚', n: 'green heart' }, { e: '💙', n: 'blue heart' }, { e: '💜', n: 'purple heart' },
  { e: '🖤', n: 'black heart' }, { e: '💔', n: 'broken heart' }, { e: '💯', n: 'hundred score perfect' },
  { e: '🔥', n: 'fire lit hot' }, { e: '✨', n: 'sparkles shine' }, { e: '⭐', n: 'star' },
  { e: '🌟', n: 'glowing star' }, { e: '⚡', n: 'lightning zap bolt' }, { e: '💥', n: 'boom collision' },
  { e: '🎉', n: 'party tada celebrate' }, { e: '🎊', n: 'confetti' }, { e: '🎈', n: 'balloon' },
  { e: '🎁', n: 'gift present' }, { e: '🏆', n: 'trophy win award' }, { e: '🥇', n: 'gold medal first' },
  { e: '✅', n: 'check done yes tick' }, { e: '❌', n: 'cross no x wrong' }, { e: '⚠️', n: 'warning caution' },
  { e: '❗', n: 'exclamation important' }, { e: '❓', n: 'question' }, { e: '💡', n: 'idea bulb light' },
  { e: '📌', n: 'pin pushpin' }, { e: '📍', n: 'location pin' }, { e: '🔔', n: 'bell notify' },
  { e: '📣', n: 'megaphone announce' }, { e: '📢', n: 'loudspeaker announce' }, { e: '🚀', n: 'rocket launch ship' },
  { e: '🎯', n: 'target dart goal' }, { e: '📈', n: 'chart up growth' }, { e: '📉', n: 'chart down' },
  { e: '📊', n: 'bar chart stats' }, { e: '💰', n: 'money bag cash' }, { e: '💵', n: 'dollar money' },
  { e: '💸', n: 'money fly spend' }, { e: '🛒', n: 'cart shopping buy' }, { e: '🏷️', n: 'tag label price' },
  { e: '📝', n: 'memo note write edit' }, { e: '📄', n: 'page document file' }, { e: '📋', n: 'clipboard list' },
  { e: '📅', n: 'calendar date' }, { e: '📆', n: 'calendar' }, { e: '⏰', n: 'alarm clock time' },
  { e: '⏳', n: 'hourglass wait' }, { e: '🔒', n: 'lock secure' }, { e: '🔑', n: 'key' },
  { e: '🔍', n: 'search magnify find' }, { e: '🔗', n: 'link chain' }, { e: '📎', n: 'paperclip attach' },
  { e: '✏️', n: 'pencil write edit' }, { e: '🖊️', n: 'pen' }, { e: '🎬', n: 'clapper film movie video' },
  { e: '🎥', n: 'camera movie video' }, { e: '📷', n: 'camera photo' }, { e: '📸', n: 'camera flash' },
  { e: '🎤', n: 'mic microphone sing' }, { e: '🎧', n: 'headphones music' }, { e: '🎵', n: 'note music' },
  { e: '🎶', n: 'notes music' }, { e: '🎨', n: 'art palette paint' }, { e: '🖌️', n: 'brush paint' },
  { e: '💻', n: 'laptop computer' }, { e: '🖥️', n: 'desktop computer' }, { e: '📱', n: 'phone mobile' },
  { e: '⌨️', n: 'keyboard type' }, { e: '🖱️', n: 'mouse' }, { e: '💾', n: 'save disk floppy' },
  { e: '🌐', n: 'globe web internet world' }, { e: '🧠', n: 'brain mind smart' }, { e: '🦾', n: 'mechanical arm' },
  { e: '🤖', n: 'robot ai bot' }, { e: '👻', n: 'ghost' }, { e: '☕', n: 'coffee cafe' },
  { e: '🍕', n: 'pizza food' }, { e: '🍔', n: 'burger food' }, { e: '🌮', n: 'taco food' },
  { e: '🎂', n: 'cake birthday' }, { e: '🍩', n: 'donut' }, { e: '🍿', n: 'popcorn movie' },
  { e: '🌈', n: 'rainbow' }, { e: '☀️', n: 'sun sunny' }, { e: '🌙', n: 'moon night' },
  { e: '⛅', n: 'cloud weather' }, { e: '❄️', n: 'snow cold' }, { e: '🌊', n: 'wave ocean water' },
  { e: '🌱', n: 'seedling grow plant' }, { e: '🌳', n: 'tree' }, { e: '🌸', n: 'blossom flower' },
  { e: '🐶', n: 'dog puppy' }, { e: '🐱', n: 'cat' }, { e: '🦄', n: 'unicorn' },
  { e: '🐝', n: 'bee' }, { e: '🦋', n: 'butterfly' }, { e: '🚗', n: 'car' },
  { e: '✈️', n: 'plane travel flight' }, { e: '🏠', n: 'house home' }, { e: '🏢', n: 'office building' },
  { e: '⚽', n: 'soccer ball football' }, { e: '🏀', n: 'basketball' }, { e: '🎮', n: 'game controller play' },
  { e: '🧩', n: 'puzzle piece' }, { e: '🎲', n: 'dice game' }, { e: '🏁', n: 'flag finish race' },
]

interface ListProps { items: Emoji[]; command: (e: Emoji) => void }
interface ListHandle { onKeyDown: (p: { event: KeyboardEvent }) => boolean }

const EmojiList = forwardRef<ListHandle, ListProps>(function EmojiList({ items, command }, ref) {
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [items])
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) { setActive(i => (i + 1) % items.length); return true }
      if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) { setActive(i => (i - 1 + items.length) % items.length); return true }
      if (event.key === 'Enter') { if (items[active]) command(items[active]); return true }
      return false
    },
  }))
  if (!items.length) return <div className="cs-emoji"><div className="cs-slash-empty">No emoji</div></div>
  return (
    <div className="cs-emoji">
      {items.map((it, i) => (
        <button key={it.e} type="button" className={`cs-emoji-item${i === active ? ' is-active' : ''}`}
          onMouseEnter={() => setActive(i)} onMouseDown={e => e.preventDefault()} onClick={() => command(it)}>
          <span className="cs-emoji-glyph">{it.e}</span>
          <span className="cs-emoji-name">:{it.n.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  )
})

const emojiPluginKey = new PluginKey('emojiCommand')

export const EmojiCommand = Extension.create({
  name: 'emojiCommand',
  addProseMirrorPlugins() {
    return [
      Suggestion<Emoji>({
        pluginKey: emojiPluginKey,
        editor: this.editor,
        char: ':',
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => { editor.chain().focus().deleteRange(range).insertContent(props.e + ' ').run() },
        items: ({ query }) => {
          const q = query.toLowerCase().trim()
          if (q.length < 2) return []
          return EMOJIS.filter(e => e.n.includes(q)).slice(0, 24)
        },
        render: () => {
          let component: ReactRenderer<ListHandle, ListProps> | null = null
          let popup: Instance | null = null
          return {
            onStart: props => {
              if (!props.clientRect) return
              component = new ReactRenderer(EmojiList, {
                props: { items: props.items, command: (e: Emoji) => props.command(e) }, editor: props.editor,
              })
              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect as () => DOMRect, appendTo: () => document.body,
                content: component.element, showOnCreate: true, interactive: true, trigger: 'manual',
                placement: 'bottom-start', theme: 'cs-plain', maxWidth: 'none',
              })
            },
            onUpdate: props => {
              component?.updateProps({ items: props.items, command: (e: Emoji) => props.command(e) })
              if (props.clientRect) popup?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect })
            },
            onKeyDown: props => {
              if (props.event.key === 'Escape') { popup?.hide(); return true }
              return component?.ref?.onKeyDown(props) ?? false
            },
            onExit: () => { popup?.destroy(); component?.destroy(); popup = null; component = null },
          }
        },
      }),
    ]
  },
})
