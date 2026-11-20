'use client';

import { useEffect, useRef, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import s from './RichEditor.module.scss';

const BLOCKS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'LI']);

// Bỏ những phần không bao giờ được nạp vào vùng soạn thảo; máy chủ sẽ làm sạch lại khi lưu.
function stripUnsafe(html: string) {
  return html
    .replace(/<(script|style|object|embed)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

const isHtml = (value: string) => /^\s*<[a-z]/i.test(value);

function toEditorHtml(value: string) {
  if (!value.trim()) return '';
  if (isHtml(value)) return value;
  const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${esc(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/** Trình soạn thảo bài viết: soạn trực quan (contentEditable) hoặc sửa mã HTML, tải ảnh lên Cloudinary. */
export function RichEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(() => stripUnsafe(toEditorHtml(value)));
  const [source, setSource] = useState(false);
  const [stats, setStats] = useState({ words: 0, heads: 0 });
  const [notice, setNotice] = useState('');
  const loadedValue = useRef(value);

  const measure = (markup: string, text: string) => {
    const heads = (markup.match(/<h[23]\b/gi) ?? []).length;
    setStats({ words: text.trim() ? text.trim().split(/\s+/).length : 0, heads });
  };

  const sync = () => {
    const el = ref.current;
    if (!el) return;
    setHtml(el.innerHTML);
    onChange(el.innerHTML);
    measure(el.innerHTML, el.innerText || '');
  };

  // Khi bài viết được nạp từ máy chủ (sửa bài) thì đưa nội dung mới vào vùng soạn thảo.
  useEffect(() => {
    if (value !== loadedValue.current && value !== html) {
      loadedValue.current = value;
      const next = stripUnsafe(toEditorHtml(value));
      setHtml(next);
      if (ref.current && !source) ref.current.innerHTML = next;
      measure(next, next.replace(/<[^>]+>/g, ' '));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (ref.current && !source) {
      ref.current.innerHTML = html;
      sync();
    } else {
      measure(html, html.replace(/<[^>]+>/g, ' '));
    }
    // Chỉ khi đổi chế độ hoặc lúc đầu: khi đang soạn thì vùng contentEditable giữ nội dung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // Dòng mới là <p> (không phải <div>); editor trống thì bắt đầu bằng một đoạn văn để chữ gõ vào được bọc đúng.
  const focus = () => {
    const el = ref.current;
    if (!el) return;
    document.execCommand('defaultParagraphSeparator', false, 'p');
    if (!el.innerHTML.trim()) el.innerHTML = '<p><br></p>';
    el.focus();
  };
  const exec = (command: string, arg?: string) => {
    focus();
    document.execCommand(command, false, arg);
    sync();
  };

  // Đổi kiểu khối chỉ cho phần chữ đang chọn: tách khối thành trước / phần chọn / sau.
  const applyBlock = (tag: 'h2' | 'h3' | 'p') => {
    const root = ref.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return focus();
    if (range.collapsed) return exec('formatBlock', tag);

    const blockOf = (node: Node): HTMLElement | null => {
      let current: Node | null = node;
      while (current && current.parentNode !== root) current = current.parentNode;
      return current instanceof HTMLElement ? current : null;
    };
    const a = blockOf(range.startContainer);
    const b = blockOf(range.endContainer);
    if (!a || !b || a !== b || !BLOCKS.has(a.tagName)) return exec('formatBlock', tag);

    const make = (name: string, part: Range) => {
      const el = document.createElement(name);
      el.appendChild(part.cloneContents());
      return el;
    };
    const before = document.createRange();
    before.setStart(a, 0);
    before.setEnd(range.startContainer, range.startOffset);
    const after = document.createRange();
    after.setStart(range.endContainer, range.endOffset);
    after.setEnd(a, a.childNodes.length);

    const keep = a.tagName.toLowerCase();
    const empty = (el: HTMLElement) => !el.textContent?.trim() && !el.querySelector('img,br');
    const pre = make(keep, before);
    const mid = make(tag, range);
    const post = make(keep, after);
    const nodes: HTMLElement[] = [];
    if (!empty(pre)) nodes.push(pre);
    nodes.push(mid);
    if (!empty(post)) nodes.push(post);
    a.replaceWith(...nodes);
    const selected = document.createRange();
    selected.selectNodeContents(mid);
    selection.removeAllRanges();
    selection.addRange(selected);
    sync();
  };

  const clearFormat = () => {
    focus();
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) applyBlock('p');
    sync();
  };

  const addLink = () => {
    const url = window.prompt('Nhập địa chỉ liên kết (https://...)');
    if (url && /^(https?:\/\/|\/|#|mailto:)/i.test(url.trim())) exec('createLink', url.trim());
  };
  const addImageUrl = () => {
    const url = window.prompt('Nhập địa chỉ ảnh (https://...)');
    if (url && /^https?:\/\//i.test(url.trim())) exec('insertImage', url.trim());
  };
  const addTable = () => {
    const row = `<tr>${"<td style='border:1px solid #cbd5e1;padding:6px'><br></td>".repeat(3)}</tr>`;
    exec('insertHTML', `<table style="width:100%;border-collapse:collapse"><tbody>${row.repeat(3)}</tbody></table><p><br></p>`);
  };

  // Tải ảnh lên Cloudinary qua API quản trị rồi chèn vào vị trí con trỏ.
  async function uploadImage(file: File) {
    setNotice('Đang tải ảnh lên...');
    try {
      const form = new FormData();
      form.set('file', file);
      const result = await adminFetch<{ path: string; url: string }>('/api/admin/files', { method: 'POST', body: form });
      exec('insertImage', result.url);
      setNotice('');
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Không thể tải ảnh lên.');
    }
  }

  const minutes = stats.words ? Math.max(1, Math.ceil(stats.words / 200)) : 0;
  const btn = (label: React.ReactNode, onClick: () => void, extra?: { title?: string; on?: boolean }) => (
    <button type="button" className={`${s.btn} ${extra?.on ? s.on : ''}`} onClick={onClick} disabled={source && !extra?.on} title={extra?.title}>
      {label}
    </button>
  );

  return (
    <div className={s.field}>
      <div className={s.head}>
        <span className={s.stats}>
          {stats.words} từ · {stats.heads} tiêu đề mục · ~{minutes} phút đọc
        </span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void uploadImage(file);
        }}
      />
      <div className={s.wrap}>
        <div
          className={s.bar}
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).tagName !== 'TEXTAREA') event.preventDefault();
          }}
        >
          {btn(<strong>B</strong>, () => exec('bold'), { title: 'In đậm' })}
          {btn(<em>I</em>, () => exec('italic'), { title: 'In nghiêng' })}
          {btn(<u>U</u>, () => exec('underline'), { title: 'Gạch chân' })}
          <span className={s.sep} />
          {btn('H2', () => applyBlock('h2'))}
          {btn('H3', () => applyBlock('h3'))}
          {btn('¶', () => applyBlock('p'), { title: 'Đoạn văn thường' })}
          <span className={s.sep} />
          {btn('• Danh sách', () => exec('insertUnorderedList'))}
          {btn('1. Danh sách', () => exec('insertOrderedList'))}
          <span className={s.sep} />
          {btn('Trái', () => exec('justifyLeft'))}
          {btn('Giữa', () => exec('justifyCenter'))}
          {btn('Phải', () => exec('justifyRight'))}
          <span className={s.sep} />
          {btn('🖼 Tải ảnh lên', () => fileRef.current?.click())}
          {btn('🖼 Ảnh từ URL', addImageUrl)}
          {btn('🔗 Liên kết', addLink)}
          {btn('▦ Bảng', addTable)}
          {btn('❝ Trích dẫn', () => exec('formatBlock', 'blockquote'))}
          {btn('— Kẻ ngang', () => exec('insertHorizontalRule'))}
          {btn('✕ Xoá định dạng', clearFormat, { title: 'Xoá định dạng phần đang chọn' })}
          <span className={s['bar-end']}>
            {btn('↶', () => exec('undo'), { title: 'Hoàn tác' })}
            {btn('↷', () => exec('redo'), { title: 'Làm lại' })}
            {btn('</> HTML', () => setSource((v) => !v), { on: source })}
          </span>
        </div>
        {notice && <div className={s.notice}>{notice}</div>}
        {source ? (
          <textarea
            value={html}
            onChange={(event) => {
              setHtml(event.target.value);
              onChange(event.target.value);
              measure(event.target.value, event.target.value.replace(/<[^>]+>/g, ' '));
            }}
            className={s.src}
            spellCheck={false}
            aria-label="Nội dung HTML"
          />
        ) : (
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={sync}
            onBlur={sync}
            onFocus={focus}
            className={`${s.edit} ckeditor-content`}
            data-placeholder={placeholder || 'Nhập nội dung… Dùng H2 / H3 để chia mục cho bài dễ đọc và tạo mục lục.'}
          />
        )}
      </div>
    </div>
  );
}
